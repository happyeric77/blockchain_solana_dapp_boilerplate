use anchor_lang::prelude::*;

declare_id!("6KA5onmgQN7gsBZ5whPCTVL4EQcRob6vw7TYYNvik8xb");


#[program]
pub mod anchor_programs {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, price: u64) -> ProgramResult {
        ctx.accounts.nft_creator.price = price;
        ctx.accounts.nft_creator.collection = vec![];
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer=initializer, space=500)]                   // TODO: Check who to define space
    pub nft_creator: Account<'info, NftCreator>,
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>
}

#[account]
pub struct NftCreator {
    collection: Vec<Pubkey>,
    price: u64
}



// use anchor_lang::prelude::*;

// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// #[program]
// mod counter {
//     use super::*;

//     pub fn initialize(ctx: Context<Initialize>, start: u64) -> ProgramResult {
//         let counter = &mut ctx.accounts.counter;
//         counter.authority = *ctx.accounts.authority.key;
//         counter.count = start;
//         Ok(())
//     }

//     pub fn increment(ctx: Context<Increment>) -> ProgramResult {
//         let counter = &mut ctx.accounts.counter;
//         counter.count += 1;
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(init, payer = authority, space = 48)]
//     pub counter: Account<'info, Counter>,
//     pub authority: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct Increment<'info> {
//     #[account(mut, has_one = authority)]
//     pub counter: Account<'info, Counter>,
//     pub authority: Signer<'info>,
// }

// #[account]
// pub struct Counter {
//     pub authority: Pubkey,
//     pub count: u64,
// }