// Last AI Standing — Contract Constants

export const BASE_RPC = "https://base-rpc.publicnode.com";

export const CONTRACTS = {
  /** LastAIStanding contract (Base mainnet) */
  LAS: "0x5e9e09b03d08017fddbc1652e9394e7cb4a24074" as const,
  /** USDC on Base */
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
  /** ERC-8004 Identity Registry on Base */
  IDENTITY: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const,
};

// ─── LastAIStanding ABI ──────────────────────────────────────────────
export const LAS_ABI = [
  // Views
  { type: "function", name: "COST_PER_EPOCH", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "EPOCH_DURATION", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "currentEpoch", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalAlive", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalDead", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalEverRegistered", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalAge", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalRewardsDistributed", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalPool", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "registryLength", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getAge", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "isAlive", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "isKillable", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "pendingReward", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "agentIdToAddr", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  {
    type: "function", name: "agents", inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "birthEpoch", type: "uint64" },
      { name: "lastHeartbeatEpoch", type: "uint64" },
      { name: "alive", type: "bool" },
      { name: "totalPaid", type: "uint96" },
      { name: "rewardDebt", type: "uint256" },
      { name: "claimable", type: "uint256" },
      { name: "agentId", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function", name: "getAgentList",
    inputs: [{ name: "startIndex", type: "uint256" }, { name: "endIndex", type: "uint256" }],
    outputs: [{
      type: "tuple[]", components: [
        { name: "addr", type: "address" },
        { name: "agentId", type: "uint256" },
        { name: "birthEpoch", type: "uint64" },
        { name: "lastHeartbeatEpoch", type: "uint64" },
        { name: "alive", type: "bool" },
        { name: "killable", type: "bool" },
        { name: "age", type: "uint256" },
        { name: "totalPaid", type: "uint256" },
        { name: "pendingReward", type: "uint256" },
      ],
    }],
    stateMutability: "view",
  },
  {
    type: "function", name: "getKillable",
    inputs: [{ name: "startIndex", type: "uint256" }, { name: "endIndex", type: "uint256" }],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  // Actions
  { type: "function", name: "register", inputs: [{ name: "agentId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "heartbeat", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "kill", inputs: [{ name: "target", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "claim", inputs: [], outputs: [], stateMutability: "nonpayable" },
] as const;

// ─── ERC-8004 Identity Registry ABI (subset) ────────────────────────
export const IDENTITY_ABI = [
  { type: "function", name: "getAgentWallet", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "tokenURI", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "ownerOf", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
] as const;

// ─── ERC-20 ABI (subset) ────────────────────────────────────────────
export const ERC20_ABI = [
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
] as const;
