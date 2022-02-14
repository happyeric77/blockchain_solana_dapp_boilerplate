import { useContext, createContext } from "react";

const DappContext = createContext<DappContextType>({
    splTokens: undefined,
})

export default function useDapp() {
    return useContext(DappContext)
}

export {DappContext}
