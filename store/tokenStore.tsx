import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { createContext, useContext } from "react";
import { useQuery } from "react-query";

export async function fetchSPLTokens() {
  let rawTokenList = await new TokenListProvider().resolve();
  return rawTokenList.filterByClusterSlug("mainnet-beta").getList();
}

// export function useTokenController() {
//   let {
//     data: tokenList,
//     isLoading,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery("tokens", fetchSPLTokens, {
//     refetchOnMount: false,
//   });

//   return {
//     tokenList,
//     refreshTokens: refetch as any,
//     isLoading,
//     error,
//     isFetching,
//   };
// }

// const TokenContext = createContext<ReturnType<typeof useTokenController>>({
//   tokenList: [] as TokenInfo[],
//   refreshTokens: () => {},
//   isLoading: true,
//   error: undefined,
//   isFetching: false,
// });

// export function TokenProvider(props: any) {
//   return (
//     <TokenContext.Provider value={useTokenController()}>
//       {props.children}
//     </TokenContext.Provider>
//   );
// }

// export function useToken() {
//   return useContext(TokenContext);
// }

export function useToken() {
  return useQuery("tokens", fetchSPLTokens, {
    refetchOnMount: false,
  });
}
