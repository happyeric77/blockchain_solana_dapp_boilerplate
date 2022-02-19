import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { AnchorPrograms } from '../target/types/anchor_programs';
import { SystemProgram, Transaction } from '@solana/web3.js';

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
      new anchor.BN("3"),
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
  });
});
