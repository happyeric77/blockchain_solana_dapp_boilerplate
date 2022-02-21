import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { AnchorPrograms } from '../target/types/anchor_programs';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

describe('anchor_programs', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorPrograms as Program<AnchorPrograms>;
  const provider = anchor.Provider.env();
                                                                                          /**@BaseAccounts */
  const nftCreatorAcc = anchor.web3.Keypair.generate();                                   // The nft creator state account
  const payer = anchor.web3.Keypair.generate();                                           // payer keypair to allowcate airdropped funds 
  const initializerMainAccount = anchor.web3.Keypair.generate();                          // initializer (or main operator) account
                                                                                  
  it("Setup program state", async () => {

                                                                                  // Airdrop 1000 SOL to payer
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payer.publicKey, 1000000000000),
      "confirmed"
    )
                                                                                  // Payer funds initializer main account                 
     await provider.send(                                                             // Trigger a transaction: args --> 1. Transaction 2. signer[]
      (() => {
        const tx = new Transaction();                                                 // Create a empty Transaction called tx (NOTE: one Transaction can contain multi instructions)
        tx.add(                                                                       // Add first instruction into tx 
          SystemProgram.transfer({                                                    // First transaction is "SystemProgram.transfer" to fund SOL from payer to initializer's main account
            fromPubkey: payer.publicKey,
            toPubkey: initializerMainAccount.publicKey,
            lamports: 100000000000,
          }),
        );
        return tx;
      })(),                                             
      [payer]
    );
                                                                                                // Check all account state
    console.log("payer's address", payer.publicKey.toString())                                      /**@payer Address */
    let payerBalance = await provider.connection.getBalance(payer.publicKey)        
    console.log("payer's balance: ", payerBalance/1e9, " SOL")                                        // List payer's SOL balance
    console.log("nftCreatorAcc: ", nftCreatorAcc.publicKey.toString())                              /**@nftCreator Address */

    let initializerBal = await provider.connection.getBalance(initializerMainAccount.publicKey)     /**@initializer Address */
    console.log("initializer's account: ", initializerMainAccount.publicKey.toString())              
    console.log("initializer's balance: ", initializerBal/1e9, " SOL")                                // List initializer's SOL balance
  })

  it('is initialized', async () => {
    const tx = await program.rpc.initialize(
      new anchor.BN((0.3*1e9).toString()),
      {
        accounts: {
          nftCreator: nftCreatorAcc.publicKey,
          initializer: initializerMainAccount.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        // instructions: [await program.account.nftCreator.createInstruction(nftCreatorAcc)],
        signers: [initializerMainAccount, nftCreatorAcc]
      }
    );
    console.log("Your transaction signature", tx);

                                                                                                      // Fetch intialized account data info
    let data = await program.account.nftCreator.fetch(nftCreatorAcc.publicKey)
    console.log("Created NFT items",data.collection)
    console.log("Price: ", Number(data.price)/1e9, "SOL")
  });

  it('is minted', async () => {
    let rand_seed = Math.round(Math.random()*10000)
    let seed = `nft_creator_${rand_seed}`
    let [mint_pda, bump_seed] = await anchor.web3.PublicKey.findProgramAddress(               // Use findProgram Address to generate PDA
        [Buffer.from(anchor.utils.bytes.utf8.encode(seed,))],
        program.programId
    )
    const tx = await program.rpc.mintnft(
      bump_seed, 
      seed,
      {                                                // Call program mintnft instruction
        accounts: {                                                                       /**@ACCOUNTS */
            minter: initializerMainAccount.publicKey,                                       // 1. minter as the initializer
            nftCreater: nftCreatorAcc.publicKey,
            nftCreaterProgram: program.programId,                                           // 2. this program id
            mintPdaAcc: mint_pda,                                                           // 3. The mint_pda just generated
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,                                           // 4. sysVar 
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [initializerMainAccount]
    }); 
    let pda_bal = await provider.connection.getBalance(mint_pda)
    console.log(
      "\nYour transaction signature: ", tx,
      "\nAccounts info:", 
      "\nminter: ", initializerMainAccount.publicKey.toBase58(), 
      "\nmint_pda_acc: ", mint_pda.toBase58(),
      "\nmint_pda_lamport: ", pda_bal,
      "\nmint_creater_program: ", program.programId.toBase58(),
      "\nmint_seed: ", seed,
      "\nmint_bump: ", bump_seed
    )
  });
});
