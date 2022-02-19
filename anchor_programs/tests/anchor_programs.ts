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

                                                                                  // Create corrisponding accounts
  const nftCreatorAcc = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  const initializerMainAccount = anchor.web3.Keypair.generate();
                                                                                  
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
    let [mint_pda, _bump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("nft_creator"))],
        program.programId
    )
    
    console.log("\n token program id: ",TOKEN_PROGRAM_ID.toBase58(), "\n", 
        "minter acc pubkey: ",initializerMainAccount.publicKey.toBase58(),"\n",
        "nft-creator state acc pubkey: ", nftCreatorAcc.publicKey.toBase58(),"\n",
        "nft-creator program acc pubkey", program.programId.toBase58(), "\n", 
        "mint-pda acc pubkey", mint_pda.toBase58(), "\n")

    const tx = await program.rpc.mintnft({
        accounts: {
            tokenProgram: TOKEN_PROGRAM_ID,
            minter: initializerMainAccount.publicKey,
            nftCreater: nftCreatorAcc.publicKey,
            nftCreaterProgram: program.programId,
            mintPdaAcc: mint_pda,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [initializerMainAccount]
    });
    console.log("Your transaction signature", tx);

    //                                                                                                   // Fetch intialized account data info
    // let data = await program.account.nftCreator.fetch(nftCreatorAcc.publicKey)
    // console.log("Created NFT items",data.collection)
    // console.log("Price: ", Number(data.price)/1e9, "SOL")
    
  });
});