import { useContext, createContext } from "react";
import { PublicKey,} from '@solana/web3.js'

let AnchorContext = createContext<AnchorContextType>({
    provider: undefined,
    programId: new PublicKey("ArT6Hwus2hMwmNeNeJ2zGcQnvZsbrhz8vTbBdq35AdgG"),
    program: undefined,
    programStateAcc: new PublicKey("A5ENiMaXkkkWjAeERwGAiotaXsVjvRC1tByB9RdA8feD"),
    signerWallet: undefined,
})

export default function useAnchor () {
    return useContext(AnchorContext)
}

export {AnchorContext}