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
    pub fn mintnft(ctx: Context<MintNFT>, bump_seed: u8) -> ProgramResult {
        msg!("First line in MintNFT processor");
        let create_acc_ix = system_instruction::create_account(        // Try create account using system_instruction
            &ctx.accounts.minter.key(),
            &ctx.accounts.mint_pda_acc.key(),
            ctx.accounts.rent.minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            &spl_token::ID,
        );
        
        invoke_signed(                                              // Use invoke to call cross program invocation
            &create_acc_ix, 
            &[                          
                ctx.accounts.minter.clone(),
                ctx.accounts.mint_pda_acc.clone(),
                // ctx.accounts.nft_creater_program.clone(),
            ],
            &[&[ &b"nft_creator"[..], &[bump_seed] ]]
        )?;        
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
#[instruction(bump_seed: u8)]
pub struct MintNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: AccountInfo<'info>,
    pub nft_creater_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
#[account]
pub struct NftCreator {
    collection: Vec<Pubkey>,
    price: u64
}
