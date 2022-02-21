use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use solana_program::program::{invoke_signed, invoke};
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
        ctx.accounts.create_mint_pda_acc(&bump_seed, &mint_seed)?;     
        ctx.accounts.init_mint_pda_acc()?;
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
    pub nft_creater: AccountInfo<'info>,
    pub nft_creater_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintNFT<'info> {
    fn create_mint_pda_acc(&self, bump_seed: &u8, mint_seed: &String) -> ProgramResult {
        let create_acc_ix = system_instruction::create_account(         // Try create account using system_instruction
            &self.minter.key(),
            &self.mint_pda_acc.key(),
            self.rent.minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            &spl_token::ID,
        );
                                                                                    // @invoke_signed --> SYSTEM PROGRAM (bringing System Program into scope)
                                                                                    // Use invoke_signed rather than invoke -->
                                                                                    //  - THIS PROGRAM calls SYSTEM PROGRAM's create_acount instruction
                                                                                    //  - MINT_PDA_ACCOUNT calls system program to initalized itself                                                                            
        invoke_signed(                                                            
            &create_acc_ix,                                             
            &[                          
                self.minter.clone(),
                self.mint_pda_acc.clone(),
            ],
            // &[&[ &b"nft_creator"[..], &[bump_seed] ]]
            // &[&[ &mint_seed.as_bytes()[..], &[*bump_seed] ]]
            &[&[ &mint_seed.as_ref(), &[*bump_seed] ]]
        )?; 
        Ok(())
    }
    
    fn init_mint_pda_acc(&self) -> ProgramResult {
        let init_mint_ix = spl_token::instruction::initialize_mint(
            &spl_token::ID,
            &self.mint_pda_acc.key,
            &self.nft_creater.key,
            Some(&self.nft_creater.key),
            0,
        )?;
                                                                                    // @Invoke --> SPL TOKEN PROGRAM (bringing token_program into scope)
                                                                                    // Use invoke rather than invoke_sign: THIS PROGRAM calls SPL TOKEN PROGRAM's initialize_mint instruction                                                                  
        invoke(                                                            
            &init_mint_ix,                                             
            &[                          
                self.minter.clone(),
                self.mint_pda_acc.clone(),
                self.rent.to_account_info().clone(),
            ]
        )?; 
        Ok(())
    }
}

#[account]
pub struct NftCreator {
    collection: Vec<Pubkey>,
    price: u64
}
