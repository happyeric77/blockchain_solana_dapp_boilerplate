/**
 * TODO: 
 *  1. MintNFT processor
 *      - Fail if the token mint NOT in the collection
 *      - Fail if the token mint's supply > 0
 *  2. MintNFT new impl
 *      - attach metadata
 */

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use solana_program::program::{invoke_signed, invoke};
use solana_program::system_instruction;

declare_id!("ArT6Hwus2hMwmNeNeJ2zGcQnvZsbrhz8vTbBdq35AdgG");

#[program]
pub mod anchor_programs {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, price: u64) -> ProgramResult {
        ctx.accounts.nft_creator.price = price;
        ctx.accounts.nft_creator.total_minted = 0;
        ctx.accounts.nft_creator.collection = vec![];
        Ok(())
    }    
    
    pub fn initnft(ctx: Context<InitNFT>, bump_seed: u8, mint_seed: String) -> ProgramResult {
        ctx.accounts.create_mint_pda_acc(&bump_seed, &mint_seed)?;     
        ctx.accounts.init_mint_pda_acc()?;
        ctx.accounts.update_state(&mint_seed);
        Ok(())
    }

    pub fn mintnft(ctx: Context<MintNFT>) -> ProgramResult {
        ctx.accounts.mint_nft()?;
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
pub struct InitNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: AccountInfo<'info>,    
    #[account(mut)]
    pub nft_creater: Account<'info, NftCreator>,
    pub nft_creater_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitNFT<'info> {
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
            &self.minter.key,
            Some(&self.minter.key),
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

    fn update_state(&mut self, mint_seed: &String) {
        self.nft_creater.collection.push(mint_seed.clone());
        self.nft_creater.total_minted += 1;
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: AccountInfo<'info>,
    #[account(mut)]
    pub minter_ata: Account<'info, TokenAccount>,
    pub nft_creator_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl <'info> MintNFT<'info> {
    fn mint_nft(&self) -> ProgramResult {
        let ix = spl_token::instruction::mint_to(
            &spl_token::ID, 
            self.mint_pda_acc.key, 
            self.minter_ata.to_account_info().key, 
            self.minter.key, 
            &[self.minter.key], 
            1)?;
        invoke(&ix, &[
            self.mint_pda_acc.clone(),
            self.minter_ata.to_account_info().clone(),
            self.minter.clone()
        ])?;
        Ok(())
    }
}

#[account]
pub struct NftCreator {
    collection: Vec<String>,
    total_minted: u8,
    price: u64
}

