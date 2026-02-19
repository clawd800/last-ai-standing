import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { fallback } from "viem";
import { BASE_RPC_ENDPOINTS } from "./rpcs";

const transport = fallback(
  BASE_RPC_ENDPOINTS.map((url) =>
    http(url, { timeout: 3_000, retryCount: 0, batch: true })
  ),
  { rank: false }
);

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [],
  transports: { [base.id]: transport },
});
