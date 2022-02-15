
declare global {

    // tokens.ts
    interface TokenInfo {
        symbol: string
        name: string
      
        mintAddress: string
        decimals: number
        totalSupply?: TokenAmount
      
        referrer?: string
      
        details?: string
        docs?: object
        socials?: object
      
        tokenAccountAddress?: string
        balance?: TokenAmount
        tags: string[]
      }
}
export {}