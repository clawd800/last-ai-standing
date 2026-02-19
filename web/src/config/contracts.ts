export const LAS_ADDRESS = "0x5e9e09b03d08017fddbc1652e9394e7cb4a24074" as const;

export const LAS_ABI = [
  { type: "function", name: "COST_PER_EPOCH", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "EPOCH_DURATION", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "currentEpoch", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalAlive", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalDead", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalEverRegistered", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "totalRewardsDistributed", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalPool", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "registryLength", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getAge", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "isAlive", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "isKillable", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "pendingReward", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  {
    type: "function", name: "agents", inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "birthEpoch", type: "uint64" }, { name: "lastHeartbeatEpoch", type: "uint64" },
      { name: "alive", type: "bool" }, { name: "totalPaid", type: "uint96" },
      { name: "rewardDebt", type: "uint256" }, { name: "claimable", type: "uint256" },
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
] as const;
