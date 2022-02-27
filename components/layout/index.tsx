import Head from 'next/head'
import Header from "./Header"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { Program, Provider } from '@project-serum/anchor'
import { getSPLTokenData } from "../../utils/web3"
import { useEffect, useState } from "react"
import { DappContext } from "../../hooks/useDapp"
import Loading from '../common/Loading'
import Notify from '../common/Notify'
import style from '../../styles/layout.module.sass'
import useAnchor, { AnchorContext } from '../../hooks/useAnchor'
import {Wallet} from '@project-serum/anchor/src/provider'
import idl from '../../anchor_programs/target/idl/anchor_programs.json'

function Layout({...props}): JSX.Element {

    const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
        wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
        commitment: "processed"
    });
    // -->                                                                                // 3rd party Hooks
    const {publicKey, signTransaction, signAllTransactions} = useWallet()
    const wallet = useWallet()
    // -->                                                                                // Custom Hooks
    const {programId, programStateAcc} = useAnchor()

    // -->                                                                                // React Hooks
    const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);
    const [notify, setNotify] = useState<INotify | null>(null);
    const [loading, setLoading] = useState<LoadingType | null>(null);
    const [provider, setProvider] =  useState<Provider | undefined>(undefined);
    const [program, setProgram] =  useState<Program | undefined> (undefined);
    const [signerWallet, setSignerWallet] = useState<Wallet | undefined>(undefined);

    //-->                                                                               Fetch signerWallet
    useEffect(() => {
        if ( publicKey && signTransaction && signAllTransactions) {
            setSignerWallet({publicKey, signTransaction, signAllTransactions})
        }
    }, [publicKey, signTransaction, signAllTransactions])
    //-->                                                                               Fetch Anchor Provider
    useEffect(()=>{
        if (signerWallet) {
            setProvider(new Provider(connection, signerWallet, {preflightCommitment: "recent"}))
        }
    }, [signerWallet])
    //-->                                                                               Fetch Anchor Program
    useEffect(()=>{
        if (provider) {
            //@ts-ignore
            setProgram(new Program(idl, programId, provider) as Program<AnchorPrograms>)
        }
    }, [provider])


    useEffect(()=>{                                                                       // Show notify component for 5s if there is any
        if (notify) {
            setTimeout(()=>setNotify(null), 5000)
        }
    }, [notify])

    useEffect(() => {
        if (wallet.connected) {
            setLoading({
                msg: "Loading spl tokens"
            })
            getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
                if (tokenList) {
                    setSplTokenData(() => tokenList.filter(t => t !== undefined));
                }
                setLoading(null)
            });
        } else {
            setSplTokenData([])
            setSignerWallet(undefined)
            setProvider(undefined)
            setProgram(undefined)
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
            {notify && <Notify message={notify} />}
            {loading && <Loading data={loading} />}
            <DappContext.Provider value={{
                splTokens: splTokenData,
                connection: new Connection("https://rpc-mainnet-fork.dappio.xyz", {
                    wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
                    commitment: "processed"
                }),
                setNotify: setNotify,
                setLoading: setLoading
            }}>
                <AnchorContext.Provider value={{
                    signerWallet: signerWallet,
                    provider: provider,
                    programId: programId,
                    program: program,
                    programStateAcc: programStateAcc
                }}>
                    <main className={style.layoutContainer}>{props.children}</main>
                </AnchorContext.Provider>
            </DappContext.Provider>
        </div>
    </>
}


export default Layout
