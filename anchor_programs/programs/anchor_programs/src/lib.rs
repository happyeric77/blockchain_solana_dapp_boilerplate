/**
 * TODO: 
 *  1. Optimaize space
 *  2. Set mint supply cap = 1
 *  3. wet updateable = false
 *  4. change mintAuthority after getMetadata
 */

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use solana_program::program::{invoke_signed, invoke};
use solana_program::{system_instruction};
use metaplex_token_metadata::{self, state::{Creator, self}};
declare_id!("ArT6Hwus2hMwmNeNeJ2zGcQnvZsbrhz8vTbBdq35AdgG");

#[program]
pub mod anchor_programs {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, price: u64, bump: u8) -> ProgramResult {
        ctx.accounts.nft_creator.price = price;
        ctx.accounts.nft_creator.total_minted = 0;
        ctx.accounts.nft_creator.collection = vec![];
        ctx.accounts.create_nft_manager_pda_acc(bump)?;
        Ok(())
    }    
    
    pub fn initnft(ctx: Context<InitNFT>, bump_seed: u8, mint_seed: String) -> ProgramResult {
        ctx.accounts.create_mint_pda_acc(&bump_seed, &mint_seed)?;     
        ctx.accounts.init_mint_pda_acc()?;
        ctx.accounts.update_state(&mint_seed);
        Ok(())
    }

    pub fn mintnft(ctx: Context<MintNFT>, seed: String) -> ProgramResult {
        if ctx.accounts.mint_pda_acc.supply > 0  {                                                      //Fail if the token mint's supply > 0 
            return Err(NftCreatorError::AlreadyMinted.into())
        }
        if let None = ctx.accounts.nft_creator.collection.iter().find(|item| **item == seed) {  // Fail if the token mint NOT in the collection
            return Err(NftCreatorError::ItemNotFound.into())
        };
        ctx.accounts.mint_nft()?;
        Ok(())
    }

    pub fn getmetadata(ctx: Context<GetMetadata>, bump: u8, name: String, symbol: String, uri: String) -> ProgramResult {
        ctx.accounts.get_metadata(bump, name, symbol, uri)?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(init, payer=initializer, space=101)]                   
    pub nft_creator: Account<'info, NftCreator>,
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    #[account(mut)]
    pub nft_manager: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub nft_creater_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Initialize<'info> {
    fn create_nft_manager_pda_acc(&self, bump: u8) -> ProgramResult {
        let seed = b"nft_manager16";
        let manager_bump = Pubkey::find_program_address(
            &[seed], 
            self.nft_creater_program.key).1;
        if manager_bump != bump {
            return Err(NftCreatorError::IncorrectNftManager.into())
        }
        let ix = system_instruction::create_account(
            self.initializer.key, 
            self.nft_manager.key,
            10000000, 
            8*10,
            self.nft_creater_program.key,
        );
        invoke_signed(
            &ix, 
            &[
                self.initializer.clone(),
                self.nft_manager.clone(),
            ], &[&[ &seed.as_ref(), &[bump] ]]
        )?;
        Ok(())
    }
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
#[instruction(seed: String)]
pub struct MintNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: Account<'info, Mint>,
    #[account(mut)]
    pub minter_ata: Account<'info, TokenAccount>,
    pub nft_creator: Account<'info, NftCreator>,
    pub nft_creator_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl <'info> MintNFT<'info> {
    fn mint_nft(&self) -> ProgramResult {
        let ix = spl_token::instruction::mint_to(
            &spl_token::ID, 
            self.mint_pda_acc.to_account_info().key, 
            self.minter_ata.to_account_info().key, 
            self.minter.key, 
            &[self.minter.key], 
            1)?;
        invoke(&ix, &[
            self.mint_pda_acc.to_account_info().clone(),
            self.minter_ata.to_account_info().clone(),
            self.minter.clone()
        ])?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8, name: String, symbole: String, uri: String)]
pub struct GetMetadata<'info>{
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,
    pub mint_pda_acc: Account<'info, Mint>,
    pub nft_manager: AccountInfo<'info>,
    pub metaplex_token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> GetMetadata<'info> {
    fn get_metadata(&self, bump: u8, name: String, symbol: String, uri: String) -> ProgramResult {
        let seeds = &[
            state::PREFIX.as_bytes(),
            &metaplex_token_metadata::id().to_bytes(),
            &self.mint_pda_acc.key().to_bytes(),
        ];
        let creator = Creator {
            address: self.minter.key(),
            verified: true,
            share: 100,
        };
        let (metadata_account, metadata_bump) = Pubkey::find_program_address(seeds, &metaplex_token_metadata::id());
        if bump != metadata_bump {
            return Err(NftCreatorError::IncorrectMatadataAccount.into())
        }
        let metadata_ix = metaplex_token_metadata::instruction::create_metadata_accounts(
            metaplex_token_metadata::id(),
            metadata_account.key(),
            self.mint_pda_acc.key(),
            self.minter.key(),
            self.minter.key(),
            self.minter.key(),
            name,
            symbol,
            uri,
            Some(vec![creator]),
            0,
            true,
            false,
        );
        invoke(&metadata_ix, &[
            self.mint_pda_acc.to_account_info().clone(),
            self.minter.clone(),
            self.nft_manager.clone(),
            self.metadata_account.clone(),
            self.system_program.to_account_info().clone(),
            self.rent.to_account_info().clone(),
            self.metaplex_token_program.clone()
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

#[error]
pub enum NftCreatorError {
    #[msg("mintnft Error: this mint has already been minted")]
    AlreadyMinted,
    #[msg("Cannot find this item in NFT collection")]
    ItemNotFound,
    #[msg("Input NFT manager account is not matched")]
    IncorrectNftManager,
    #[msg("Input metadata account is not matched")]
    IncorrectMatadataAccount,
}

