use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
// use solana_program::system_instruction;
use solana_program::program::invoke;
use solana_program::system_instruction;
// use solana_sdk::signature::Keypair;
// use solana_sdk::system_instruction::create_account;
// use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};


declare_id!("ArT6Hwus2hMwmNeNeJ2zGcQnvZsbrhz8vTbBdq35AdgG");

#[program]
pub mod anchor_programs {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, price: u64) -> ProgramResult {
        ctx.accounts.nft_creator.price = price;
        ctx.accounts.nft_creator.collection = vec![];
        
        Ok(())
    }    
    pub fn mintnft(ctx: Context<MintNFT>) -> ProgramResult {
        msg!("First line in MintNFT processor");
        let (mint_pda, _bump) = Pubkey::find_program_address(           // Calc PDA address from passed in nft_creater_program_id
            &[b"nft_creator"], 
            &ctx.accounts.nft_creater_program.key()
        );
        if mint_pda != ctx.accounts.mint_pda_acc.key()  {                         // Confirm if passed in PDA address is the same
            return Err(ProgramError::Custom(123))
        }
        let create_acc_ix = system_instruction::create_account(        // Try create account using system_instruction
            &ctx.accounts.minter.key(),
            &ctx.accounts.mint_pda_acc.key(),
            ctx.accounts.rent.minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            &spl_token::ID,
        );
        invoke(&create_acc_ix, &[                          // Use invoke to call cross program invocation
            ctx.accounts.minter.clone(),
            ctx.accounts.mint_pda_acc.clone(),
        ])?;        
        Ok(())
    }
    // pub fn mintnft(ctx: Context<MintNFT>) -> ProgramResult {
    //     msg!("First line in MintNFT processor");
    //     let (mint_pda, _bump) = Pubkey::find_program_address(
    //         &[b"nft_creator"], 
    //         &ctx.accounts.nft_creater_program.key()
    //     );
    //     let create_mint_ix = spl_token::instruction::initialize_mint(
    //         &ctx.accounts.token_program.key(),
    //         &mint_pda,
    //         &ctx.accounts.minter.key(),
    //         Some(&ctx.accounts.minter.key()),
    //         0,
    //     )?;
    //     msg!("token program id: {}", &ctx.accounts.token_program.key().to_string());
    //     msg!("minter acc pubkey: {}", &ctx.accounts.minter.key().to_string());
    //     msg!("nft-creator program acc pubkey: {}",&ctx.accounts.nft_creater_program.key().to_string());
    //     msg!("nft-creator acc pubkey: {}",&ctx.accounts.nft_creater.key().to_string());
    //     msg!("mint-pda acc pubkey: {}", &mint_pda.to_string());
    //     invoke(&create_mint_ix, &[
    //         ctx.accounts.minter.clone(),
    //         ctx.accounts.mint_pda_acc.clone(),
    //         ctx.accounts.token_program.clone(),
    //         // ctx.accounts.nft_creater_program.clone()
    //     ])?;
    //     Ok(())
    // }
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
// pub struct MintNFT<'info> {
//     #[account(mut)]
//     pub nft_creater: Account<'info, NftCreator>,
//     #[account(mut, signer)]
//     pub minter: AccountInfo<'info>,
//     pub nft_creater_program: AccountInfo<'info>,
//     #[account(mut)]
//     pub mint_pda_acc: AccountInfo<'info>,
//     pub token_program: AccountInfo<'info>,
//     pub rent: Sysvar<'info, Rent>
// }
pub struct MintNFT<'info> {
    #[account(mut, signer)]
    pub minter: AccountInfo<'info>,
    pub nft_creater_program: AccountInfo<'info>,
    #[account(mut)]
    pub mint_pda_acc: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>
}
#[account]
pub struct NftCreator {
    collection: Vec<Pubkey>,
    price: u64
}




// create_account(
//     &ctx.accounts.minter.key(), 
//     &new_mint.pubkey(), 
//     100000000,
//     space, 
//     &ctx.accounts.nft_creater.key(),
// );


// let space = Mint::LEN as u64;
        // let ix = system_instruction::create_account(
        //     &ctx.accounts.minter.key(), 
        //     &mint_pda, 
        //     100000000,
        //     space,
        //     &ctx.accounts.token_program.key(),
        // );
        // invoke(&ix, &[
        //     ctx.accounts.minter.clone(),
        //     ])?;


        // let ata = get_associated_token_address(&ctx.accounts.minter.key(), &new_mint.pubkey());
        // let create_ata_ix = create_associated_token_account(
        //     &ctx.accounts.minter.key(), 
        //     &ctx.accounts.minter.key(), 
        //     &new_mint.pubkey()
        // );

        // let mint_ix = spl_token::instruction::mint_to(
        //     &spl_token::ID, 
        //     &new_mint.pubkey(), 
        //     &ata,
        //     &ctx.accounts.minter.key(), 
        //     &[], 
        //     1
        // )?;

                // let rent = Rent::default().exemption_threshold;
        // let commitment = CommitmentConfig::confirmed();
        
        // let new_mint = Keypair::new();
        // Rent::get();