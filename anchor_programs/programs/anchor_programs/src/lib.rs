use anchor_lang::prelude::*;
use anchor_spl::token::{Mint};
use solana_program::program::invoke_signed;
use solana_program::system_instruction;

declare_id!("ArT6Hwus2hMwmNeNeJ2zGcQnvZsbrhz8vTbBdq35AdgG");

#[program]
pub mod anchor_programs {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, price: u64) -> ProgramResult {
        ctx.accounts.nft_creator.price = price;
        ctx.accounts.nft_creator.collection = vec![];
        
        Ok(())
    }    
    pub fn mintnft(ctx: Context<MintNFT>, bump_seed: u8, mint_seed: String) -> ProgramResult {
        msg!("First line in MintNFT processor");
        ctx.accounts.create_mint_pda_acc(bump_seed, mint_seed)?;       
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer=initializer, space=500)]                   // TODO: Check how to define space
    pub nft_creator: Account<'info, NftCreator>,
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>
}
#[derive(Accounts)]
#[instruction(bump_seed: u8, mint_seed: String)]
pub struct MintNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: AccountInfo<'info>,
    pub nft_creater_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintNFT<'info> {
    fn create_mint_pda_acc(&self, bump_seed: u8, mint_seed: String) -> ProgramResult {
        msg!("SEED STRING: {}", mint_seed);
        let create_acc_ix = system_instruction::create_account(         // Try create account using system_instruction
            &self.minter.key(),
            &self.mint_pda_acc.key(),
            self.rent.minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            &spl_token::ID,
        );
        /**
         * @invoke_signed
         * It is neccessory to use invoke_signed rather than invoke as the create_account method requires 
         * both "from_public"(minter) and "to_public"(pda) to sign.
         * @system_program
         * It needs to be brough into scope as it is called to create an account
         *  */                                                                            
        invoke_signed(                                                            
            &create_acc_ix,                                             
            &[                          
                self.minter.clone(),
                self.mint_pda_acc.clone(),
            ],
            // &[&[ &b"nft_creator"[..], &[bump_seed] ]]
            &[&[ &mint_seed.as_bytes()[..], &[bump_seed] ]]
        )?; 
        Ok(())
    }
}

#[account]
pub struct NftCreator {
    collection: Vec<Pubkey>,
    price: u64
}
