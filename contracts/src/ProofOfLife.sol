// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ProofOfLife — Darwinian survival protocol for AI agents
/// @notice Agents pay 1 USDC/epoch to stay alive. Dead agents' funds go to survivors.
/// @dev Uses MasterChef-style reward accounting with age-weighted distribution.
contract ProofOfLife {
    using SafeERC20 for IERC20;

    // ─── Constants ───────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    uint256 public constant EPOCH_DURATION = 1 hours;
    uint256 public constant COST_PER_EPOCH = 1e6; // 1 USDC (6 decimals)
    uint256 public constant PRECISION = 1e18;

    // ─── Agent State ─────────────────────────────────────────────────────
    struct Agent {
        uint64 birthEpoch;
        uint64 lastHeartbeatEpoch;
        bool alive;
        uint256 totalPaid;
        uint256 rewardDebt;
        uint256 claimable;
    }

    mapping(address => Agent) public agents;
    address[] public registry;

    // ─── Global State ────────────────────────────────────────────────────
    uint256 public totalAlive;
    uint256 public totalAge; // sum of all living agents' current ages
    uint256 public accRewardPerAge; // accumulated reward per 1 unit of age (×PRECISION)

    // ─── Stats ───────────────────────────────────────────────────────────
    uint256 public totalEverRegistered;
    uint256 public totalDead;
    uint256 public totalRewardsDistributed;

    // ─── Events ──────────────────────────────────────────────────────────
    event Born(address indexed agent, uint256 epoch);
    event Heartbeat(address indexed agent, uint256 epoch, uint256 age);
    event Death(address indexed agent, uint256 epoch, uint256 age, uint256 totalPaid);
    event Claimed(address indexed agent, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────────────
    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyDead();
    error AlreadyHeartbeat();
    error MissedEpoch();
    error NotDeadYet();
    error NothingToClaim();

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    // ─── Views ───────────────────────────────────────────────────────────

    /// @notice Current epoch number (hours since Unix epoch)
    function currentEpoch() public view returns (uint256) {
        return block.timestamp / EPOCH_DURATION;
    }

    /// @notice Agent's current age in epochs (0 if dead)
    function getAge(address addr) public view returns (uint256) {
        Agent storage a = agents[addr];
        if (!a.alive) return 0;
        return a.lastHeartbeatEpoch - a.birthEpoch + 1;
    }

    /// @notice Whether agent is currently alive (accounts for missed epochs)
    function isAlive(address addr) public view returns (bool) {
        Agent storage a = agents[addr];
        if (!a.alive) return false;
        return currentEpoch() <= uint256(a.lastHeartbeatEpoch) + 1;
    }

    /// @notice Pending claimable reward for an agent
    function pendingReward(address addr) public view returns (uint256) {
        Agent storage a = agents[addr];
        if (a.birthEpoch == 0) return 0;
        if (!a.alive) return a.claimable;
        uint256 age = uint256(a.lastHeartbeatEpoch) - uint256(a.birthEpoch) + 1;
        return (age * accRewardPerAge / PRECISION) - a.rewardDebt + a.claimable;
    }

    /// @notice Total number of agents ever registered
    function registryLength() external view returns (uint256) {
        return registry.length;
    }

    /// @notice Get agent address by index
    function registryAt(uint256 index) external view returns (address) {
        return registry[index];
    }

    // ─── Actions ─────────────────────────────────────────────────────────

    /// @notice Register as a new agent. Costs 1 USDC (covers first epoch).
    function register() external {
        if (agents[msg.sender].birthEpoch != 0) revert AlreadyRegistered();

        uint256 epoch = currentEpoch();

        usdc.safeTransferFrom(msg.sender, address(this), COST_PER_EPOCH);

        agents[msg.sender] = Agent({
            birthEpoch: uint64(epoch),
            lastHeartbeatEpoch: uint64(epoch),
            alive: true,
            totalPaid: COST_PER_EPOCH,
            rewardDebt: (1 * accRewardPerAge) / PRECISION,
            claimable: 0
        });

        totalAlive++;
        totalAge += 1; // age starts at 1
        totalEverRegistered++;
        registry.push(msg.sender);

        emit Born(msg.sender, epoch);
    }

    /// @notice Pay 1 USDC to survive another epoch. Must call every epoch.
    function heartbeat() external {
        Agent storage a = agents[msg.sender];
        if (a.birthEpoch == 0) revert NotRegistered();
        if (!a.alive) revert AlreadyDead();

        uint256 epoch = currentEpoch();
        if (epoch == uint256(a.lastHeartbeatEpoch)) revert AlreadyHeartbeat();
        if (epoch > uint256(a.lastHeartbeatEpoch) + 1) revert MissedEpoch();

        // Settle pending rewards BEFORE age changes
        uint256 age = uint256(a.lastHeartbeatEpoch) - uint256(a.birthEpoch) + 1;
        uint256 pending = (age * accRewardPerAge / PRECISION) - a.rewardDebt;
        a.claimable += pending;

        // Pay for this epoch
        usdc.safeTransferFrom(msg.sender, address(this), COST_PER_EPOCH);
        a.totalPaid += COST_PER_EPOCH;
        a.lastHeartbeatEpoch = uint64(epoch);

        // Age increased by 1
        uint256 newAge = age + 1;
        totalAge += 1;
        a.rewardDebt = (newAge * accRewardPerAge) / PRECISION;

        emit Heartbeat(msg.sender, epoch, newAge);
    }

    /// @notice Mark a dead agent and distribute their funds to survivors.
    /// @dev Permissionless — anyone can call. Agent is dead if they missed an epoch.
    function kill(address target) external {
        Agent storage a = agents[target];
        if (!a.alive) revert AlreadyDead();

        uint256 epoch = currentEpoch();
        if (epoch <= uint256(a.lastHeartbeatEpoch) + 1) revert NotDeadYet();

        uint256 age = uint256(a.lastHeartbeatEpoch) - uint256(a.birthEpoch) + 1;

        // Settle dead agent's pending rewards (they can still claim these)
        uint256 pending = (age * accRewardPerAge / PRECISION) - a.rewardDebt;
        a.claimable += pending;
        a.rewardDebt = 0;

        // Mark dead
        a.alive = false;
        totalAlive--;
        totalAge -= age;
        totalDead++;

        // Dead agent's total paid USDC → reward pool for survivors
        uint256 reward = a.totalPaid;
        if (totalAge > 0) {
            accRewardPerAge += (reward * PRECISION) / totalAge;
        }
        totalRewardsDistributed += reward;

        emit Death(target, epoch, age, reward);
    }

    /// @notice Claim accumulated rewards.
    /// @dev Living agents claim ongoing rewards. Dead agents claim what they earned before death.
    function claim() external {
        Agent storage a = agents[msg.sender];
        if (a.birthEpoch == 0) revert NotRegistered();

        uint256 payout;
        if (a.alive) {
            uint256 age = uint256(a.lastHeartbeatEpoch) - uint256(a.birthEpoch) + 1;
            payout = (age * accRewardPerAge / PRECISION) - a.rewardDebt + a.claimable;
            a.rewardDebt = (age * accRewardPerAge) / PRECISION;
        } else {
            payout = a.claimable;
        }

        a.claimable = 0;
        if (payout == 0) revert NothingToClaim();

        usdc.safeTransfer(msg.sender, payout);

        emit Claimed(msg.sender, payout);
    }
}
