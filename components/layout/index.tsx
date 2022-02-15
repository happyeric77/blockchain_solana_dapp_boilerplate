
import Head from 'next/head'
import Header from "./Header"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { getSPLTokenData } from "../../utils/web3"
import { useEffect, useState } from "react"
import { DappContext } from "../../hooks/useDapp"

function Layout({...props}): JSX.Element {

    
    const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
        wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
        commitment: "processed"
    });

    // Solana Wallet Adapter Hooks
    const wallet = useWallet();

    // React Hooks
    const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);

    useEffect(() => {
        if (wallet.connected) {
            getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
                if (tokenList) {
                    setSplTokenData(() => tokenList.filter(t => t !== undefined));
                }
            });
        }
    }, [wallet.connected]);

    return <>
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            {/* fontawesome */}
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.3/css/all.css" integrity="sha384-SZXxX4whJ79/gErwcOYf+zWLeJdY/qpuqC4cAa9rOGUstPomtqpuNWT9wdPEn2fk" crossOrigin="anonymous"/>
            <title>Solana DAPP Boilerplate</title>
        </Head>

        <div  >
            <Header />
            <DappContext.Provider value={{
                splTokens: splTokenData,
                connection: new Connection("https://rpc-mainnet-fork.dappio.xyz", {
                    wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
                    commitment: "processed"
                })
            }}>
                <main >{props.children}</main>
            </DappContext.Provider>
        </div>
    </>
}


export default Layout
