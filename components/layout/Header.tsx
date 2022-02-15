import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Class from "./Header.module.sass"
import Link from "next/link";

export default function Header() {
    const wallet = useWallet()
    
    return <>
        <div style={{display: "flex", justifyContent: "space-between"}}>
            <Link href="/my_spl">My SPL Tokens</Link>
            <Link href="/">Home</Link>
            <Link href="/exchange">Exchange</Link>
            <WalletModalProvider>
                {wallet.connected ? <WalletDisconnectButton /> : <WalletMultiButton />}
            </WalletModalProvider>
        </div>    
    </>
}