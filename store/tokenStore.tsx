import { TokenListProvider } from "@solana/spl-token-registry";
import { useQuery } from "react-query";

export async function fetchSPLTokens() {
  let rawTokenList = await new TokenListProvider().resolve();
  return rawTokenList.filterByClusterSlug("mainnet-beta").getList();
}

export function useToken() {
  return useQuery("tokens", fetchSPLTokens, {
    refetchOnMount: false,
  });
}
