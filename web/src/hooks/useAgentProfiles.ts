import { useQuery } from "@tanstack/react-query";
import { publicClient } from "@/config/client";
import { CONTRACTS, IDENTITY_ABI, ERC8004_SCAN_BASE } from "@/config/contracts";
import { FALLBACK_IPFS_GATEWAYS, getNextIpfsUrl } from "./useIpfsImage";

export interface AgentProfile {
  tokenId: bigint;
  name: string;
  image: string | null;
  description: string | null;
  scanUrl: string;
}

const IPFS_GATEWAY = `https://${FALLBACK_IPFS_GATEWAYS[0]}/ipfs/`;

function resolveUri(uri: string): string {
  if (uri.startsWith("ipfs://")) return IPFS_GATEWAY + uri.slice(7);
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  return uri;
}

function parseDataUri(uri: string): unknown | null {
  if (!uri.startsWith("data:")) return null;
  const commaIdx = uri.indexOf(",");
  if (commaIdx === -1) return null;
  const meta = uri.slice(5, commaIdx);
  const body = uri.slice(commaIdx + 1);
  try {
    if (meta.includes("base64")) return JSON.parse(atob(body));
    return JSON.parse(decodeURIComponent(body));
  } catch {
    return null;
  }
}

async function fetchMetadata(
  uri: string,
): Promise<{ name?: string; image?: string; description?: string } | null> {
  const inline = parseDataUri(uri);
  if (inline)
    return inline as { name?: string; image?: string; description?: string };

  let targetUrl = resolveUri(uri);
  let currentGatewayIndex = 0;
  const isIpfs = uri.startsWith("ipfs://");

  while (true) {
    try {
      try {
        const res = await fetch(targetUrl, {
          signal: AbortSignal.timeout(isIpfs ? 2_000 : 5_000),
        });
        if (res.ok) {
          return await res.json();
        }
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (isIpfs) throw err; // Skip allorigins for IPFS since gateways typically handle CORS

        // Fallback for CORS or other fetch errors using allorigins.win
        const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const fallbackRes = await fetch(fallbackUrl, {
          signal: AbortSignal.timeout(5_000),
        });
        if (!fallbackRes.ok) throw err;
        const data = await fallbackRes.json();
        if (!data.contents) throw err;
        return JSON.parse(data.contents);
      }
    } catch {
      if (!isIpfs) return null;
      const nextUrl = getNextIpfsUrl(targetUrl, currentGatewayIndex);
      if (!nextUrl) return null;
      targetUrl = nextUrl;
      currentGatewayIndex++;
    }
  }
}

const registry = { address: CONTRACTS.IDENTITY, abi: IDENTITY_ABI } as const;

/**
 * Fetch token URIs for agents using multicall.
 */
export function useAgentURIs(agentIdMap: Map<string, bigint>) {
  const entries = [...agentIdMap.entries()]; // [addr, agentId][]

  return useQuery({
    queryKey: ["agentURIs", entries.map(([a, id]) => `${a}:${id}`).join(",")],
    queryFn: async (): Promise<Map<string, string>> => {
      if (entries.length === 0) return new Map();

      const batchSize = 100;
      const uriResults: any[] = [];
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const batchResults = await publicClient.multicall({
          contracts: batch.map(([, agentId]) => ({
            ...registry,
            functionName: "tokenURI" as const,
            args: [agentId] as const,
          })),
          allowFailure: true,
        });
        uriResults.push(...batchResults);
      }

      const uris = new Map<string, string>();
      entries.forEach(([addr], i) => {
        const res = uriResults[i];
        if (res.status === "success" && res.result) {
          uris.set(addr.toLowerCase(), res.result as string);
        }
      });
      return uris;
    },
    enabled: entries.length > 0,
    staleTime: Infinity, // URIs rarely change
  });
}

/**
 * Fetch a single agent profile from its metadata URI.
 */
export function useAgentProfile(agentId: bigint, uri?: string) {
  return useQuery({
    queryKey: ["agentProfile", agentId.toString(), uri],
    queryFn: async (): Promise<AgentProfile | null> => {
      if (!uri) return null;
      const meta = await fetchMetadata(uri);
      if (!meta?.name) return null;

      return {
        tokenId: agentId,
        name: meta.name,
        image: meta.image ? resolveUri(meta.image) : null,
        description: meta.description ?? null,
        scanUrl: `${ERC8004_SCAN_BASE}/${agentId}`,
      };
    },
    enabled: !!uri && agentId > 0n,
    staleTime: Infinity, // Profile metadata rarely changes
  });
}
