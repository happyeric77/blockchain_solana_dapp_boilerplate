import { useContext, createContext } from "react";
import { Connection, clusterApiUrl, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { AnchorPrograms } from '../anchor_programs/target/types/anchor_programs';
import idl from '../anchor_programs/target/idl/anchor_programs.json'

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