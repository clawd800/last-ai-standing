// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {LastAIStanding} from "../src/LastAIStanding.sol";

contract DeployScript is Script {
    // Base mainnet addresses
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant ERC8004_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;

    function run() external {
        uint256 epochDuration = vm.envOr("EPOCH_DURATION", uint256(1 hours));
        uint256 costPerEpoch = vm.envOr("COST_PER_EPOCH", uint256(1e6));

        vm.startBroadcast();
        LastAIStanding las = new LastAIStanding(BASE_USDC, ERC8004_REGISTRY, epochDuration, costPerEpoch);
        vm.stopBroadcast();
    }
}
