import { useState, useEffect } from "react";

export const FALLBACK_IPFS_GATEWAYS = [
  "ipfs.filebase.io",
  "ipfs.io",
  "eu.orbitor.dev",
  "ipfs.orbitor.dev",
  "latam.orbitor.dev",
  "apac.orbitor.dev",
  "4everland.io",
  "ipfs.ecolatam.com",
  "storry.tv",
  "dget.top",
  "w3s.link",
  "ipfs.cyou"
];

/**
 * Returns the next fallback IPFS URL.
 *
 * @param currentUrl The current IPFS URL.
 * @param currentGatewayIndex (Optional) The index of the current gateway in FALLBACK_IPFS_GATEWAYS.
 *                             If not provided, the function will try to determine it by the hostname.
 *
 * @returns The new IPFS URL with the next fallback gateway, or null if no additional fallback is available.
 */
export function getNextIpfsUrl(
  currentUrl: string,
  currentGatewayIndex?: number,
): string | null {
  try {
    const parsedUrl = new URL(currentUrl);
    let index: number;
    if (typeof currentGatewayIndex === "number") {
      index = currentGatewayIndex;
    } else {
      // If the current hostname is one of our gateways, use its index; otherwise default to 0.
      index = FALLBACK_IPFS_GATEWAYS.indexOf(parsedUrl.hostname);
      if (index === -1) {
        index = 0;
      }
    }
    const nextIndex = index + 1;
    if (nextIndex >= FALLBACK_IPFS_GATEWAYS.length) {
      return null; // No further fallback available.
    }
    parsedUrl.hostname = FALLBACK_IPFS_GATEWAYS[nextIndex];
    return parsedUrl.toString();
  } catch (error) {
    console.error("Error in getNextIpfsUrl:", error);
    return null;
  }
}

function useIpfsImage(initialUrl?: string | null) {
  const [url, setUrl] = useState(initialUrl);
  // maxTries now represents the current gateway index (starting at 0)
  const [maxTries, setMaxTries] = useState(0);

  useEffect(() => {
    setUrl(initialUrl);
    setMaxTries(0);
  }, [initialUrl]);

  function handleFallback() {
    if (!url) return;
    const nextUrl = getNextIpfsUrl(url, maxTries);
    if (nextUrl) {
      setUrl(nextUrl);
      setMaxTries(maxTries + 1);
    } else {
      setUrl(null);
    }
  }

  return { url, handleFallback };
}

export default useIpfsImage;
