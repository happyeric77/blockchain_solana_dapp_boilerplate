import { web3 } from '@project-serum/anchor'
import * as anchor from '@project-serum/anchor';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

import useAnchor from '../hooks/useAnchor';
import useDapp from '../hooks/useDapp';
import { useEffect, useState } from 'react';
import { Input, InputGroup, InputLeftAddon, Button, ButtonGroup } from '@chakra-ui/react'

export default function NftCreator() {
    const {signerWallet, program, provider, programStateAcc} = useAnchor()
    const {setNotify, setLoading} = useDapp()

    const [nftName, setNftName] = useState<string>("")
    const [nftSymbol, setNftSymbol] = useState<string>("")
    const [nftUri, setNftUri] = useState<string>("")

    useEffect(()=>{
        if (!signerWallet  || !program  || !provider ) {
            setNotify!({
                status: "warning",
                title: "Wallet not connected",
                description: "Please login with your wallet"
            })
        } 
        provider.connection.getProgramAccounts(program?.programId).then((data)=>console.log(data[1].pubkey.toBase58()))
    }, [])

    if (!signerWallet  || !program  || !provider ) {
        return <>Log in with your wallet</>
    } 

    async function initCreator() {
        let nft_manager_seed = `nft_manager16`
        let [nft_manager_pda, nft_manager_bump] = await anchor.web3.PublicKey.findProgramAddress(               // Use findProgram Address to generate PDA
            [Buffer.from(anchor.utils.bytes.utf8.encode(nft_manager_seed))],
            program!.programId
        )
        const nftCreatorAcc = anchor.web3.Keypair.generate();
        let tx = await program!.rpc.initialize(
            new anchor.BN((0.3*1e9).toString()),
            nft_manager_bump,
            {
                accounts: {
                    nftCreator: nftCreatorAcc.publicKey,
                    initializer: signerWallet!.publicKey,
                    systemProgram: SystemProgram.programId,
                    nftCreaterProgram: program!.programId,
                    rent: web3.SYSVAR_RENT_PUBKEY,
                    nftManager: nft_manager_pda,
                },
                signers: [nftCreatorAcc]
            }            
        )
        console.log("Your transaction signature", tx);
                                                                                                      // Fetch intialized account data info
        let data = await program!.account.nftCreator.fetch(nftCreatorAcc.publicKey)
        console.log("Created NFT items",data.collection)
        console.log("Price: ", Number(data.price)/1e9, "SOL")
        console.log("Total minted: ", Number(data.totalMinted))
    }

    async function checkState() {
        program!.account.nftCreator.fetch(programStateAcc).then(data=>console.log(data))
    }

    async function initNft (): Promise<[string, string]> {
        let rand_seed = Math.round(Math.random()*10000)
        let seed = `nft#${rand_seed}`
        let [mint_pda, bump_seed] = await anchor.web3.PublicKey.findProgramAddress(               // Use findProgram Address to generate PDA
            [Buffer.from(anchor.utils.bytes.utf8.encode(seed,))],
            program!.programId
        )
        const tx = await program!.rpc.initnft(
            bump_seed, 
            seed,
            {                                                // Call program mintnft instruction
                accounts: {                                                                       /**@ACCOUNTS */
                    minter: signerWallet!.publicKey,                                      // 1. minter as the initializer
                    nftCreater: programStateAcc,
                    nftCreaterProgram: program!.programId,                                           // 2. this program id
                    mintPdaAcc: mint_pda,                                                          // 3. The mint_pda just generated
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,                                           // 4. sysVar 
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                // signers: [initializerMainAccount]
            }
        );
        let pda_bal = await provider.connection.getBalance(mint_pda)
        let updated_state = await program!.account.nftCreator.fetch(programStateAcc)
        console.log(
            "\nYour transaction signature: ", tx,
            "\nAccounts info:", 
            "\nminter: ", signerWallet!.publicKey.toBase58(), 
            "\nmint_pda_acc: ", mint_pda.toBase58(),
            "\nmint_pda_lamport: ", pda_bal,
            "\nnft_creater_program: ", program!.programId.toBase58(),
            "\nmint_seed: ", seed,
            "\nmint_bump: ", bump_seed,
            "\nCreated NFT items", updated_state.collection,
            "\nTotal minted: ", Number(updated_state.totalMinted)
        )
        return [mint_pda.toBase58(), seed]
    }
    async function mintNft(mint_pda: string, minted_seed: string): Promise<string> {
        let token_mint_pubkey = new PublicKey(mint_pda)
        const minter_ata = (await PublicKey.findProgramAddress(
            [
                signerWallet!.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                token_mint_pubkey.toBuffer()
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        ))[0];
        let create_ata_ix = Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            token_mint_pubkey,
            minter_ata,
            signerWallet!.publicKey,
            signerWallet!.publicKey,
        )
        let tx_ata = new Transaction();
        tx_ata.add(create_ata_ix)
        await provider.send(
            tx_ata,
        )
        
        const tx = await program!.rpc.mintnft(
            minted_seed,
            {                                                // Call program mintnft instruction
                accounts: {                                                                       /**@ACCOUNTS */
                    minter: signerWallet!.publicKey,                                          // 2. this program id
                    mintPdaAcc: token_mint_pubkey,  
                    minterAta: minter_ata,                                                         // 3. The mint_pda just generated
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,                                           // 4. sysVar 
                    nftCreator: programStateAcc,
                    nftCreatorProgram: program!.programId,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            }
        );
        let ata_bal = await provider.connection.getTokenAccountBalance(minter_ata)
        console.log(
            "\nYour transaction signature: ", tx,
            "\nAccounts info:", 
            "\nMinter's token account: ", minter_ata.toBase58(),
            "\nMinter's token account balance: ", ata_bal.value.amount
        )
        return tx
    }
    async function createMetadata(token_mint_string: string): Promise<string | null> {        
        let nft_manager_seed = `nft_manager16`
        let [nft_manager, nft_manager_bump] = await anchor.web3.PublicKey.findProgramAddress(               // Use findProgram Address to generate PDA
            [Buffer.from(anchor.utils.bytes.utf8.encode(nft_manager_seed))],
            program!.programId
        )
        let token_mint_pubkey = new PublicKey(token_mint_string)
        let [metadata_account, metadata_account_bump] = await  PublicKey.findProgramAddress(
            [
                Buffer.from("metadata", "utf8"),
                (new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")).toBytes(),
                token_mint_pubkey.toBuffer(),
            ],
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
        )
        let name = nftName
        let symbol = nftSymbol
        let uri = nftUri
        const tx = await program!.rpc.getmetadata(
            metadata_account_bump,
            name,
            symbol,
            uri,
            {
                accounts: {
                    minter: signerWallet!.publicKey, 
                    metadataAccount: metadata_account,
                    mintPdaAcc: token_mint_pubkey,
                    nftManager: nft_manager,
                    metaplexTokenProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                },
            }      
        )
        console.log(
            "\nYour transaction signature: ", tx,
            "\nMetadata account: ", metadata_account.toBase58()
        )
        return tx
    }

    async function generateNFT () {
        if (nftName === "" || nftSymbol === "" || nftUri === "") {
            setNotify!({status: "warning", title: "Insufficient data", description: "Make sure to input data "})
            return null
        }
        setLoading!({msg: "Initing new NFT"})
        let [token_mint, seed] = await initNft()
        if (!token_mint) {
            setLoading!(null)
            setNotify!({
                status:  "error",
                title:  "FAILED",
                description: "Fail to init NFT",
            })
            return
        } else {setLoading!({msg: "Minting NFT"})}
        let mint_nft_tx = await mintNft(token_mint, seed)
        if (!mint_nft_tx) {
            setLoading!(null)
            setNotify!({
                status:  "error",
                title:  "FAILED",
                description: "Fail to mint NFT",
            })
        } else {setLoading!({msg: "Creating Metadata"})}
        let create_metadata_tx = await createMetadata(token_mint)
        if (!create_metadata_tx) {
            setLoading!(null)
            setNotify!({
                status:  "error",
                title:  "FAILED",
                description: "Fail to create metadata",
            })
        } else {
            setLoading!(null)
            setNotify!({
                status: "success",
                title: "NFT created successfully",
                description: `\nTx: ${create_metadata_tx}\nNft mint: ${token_mint}`
            })
        }
    }

    return <>
        {!programStateAcc && <button onClick={()=>{initCreator()}}>INIT</button>}
        <div style={{width: "300px", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", height: "500px", justifyContent: "space-evenly"}}>
            <InputGroup>
                <InputLeftAddon >Name</InputLeftAddon>
                <Input onChange={(evt)=>setNftName(evt.target.value)} type='text' placeholder='NFT name' />
            </InputGroup>
            <InputGroup>
                <InputLeftAddon>Symbol </InputLeftAddon>
                <Input onChange={(evt)=>setNftSymbol(evt.target.value)} type='text' placeholder='NFT Symbol' />
            </InputGroup>
            <InputGroup>
                <InputLeftAddon>Token URI </InputLeftAddon>
                <Input onChange={(evt)=>setNftUri(evt.target.value)} type='text' placeholder='NFT token uri' />
            </InputGroup>
            <ButtonGroup variant='outline' spacing='6'>
                <Button variant='solid' colorScheme='twitter' onClick={generateNFT}>Mint NFT</Button>
            </ButtonGroup>
        </div>
        
    </>
}