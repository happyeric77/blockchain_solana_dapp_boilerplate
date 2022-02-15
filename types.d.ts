import { Connection } from "@solana/web3.js"

declare global {

    interface IUpdateAmountData {
        type: string;
        amount: number;
    }
    
    interface INotify {
        status: AlertStatus;
        title: string;
        description: string;
        link?: string;
    }

    interface ITokenInfo {
        symbol: string;
        mintAddress: string;
        logoURI: string;
    }
    interface TokenData {
        amount: number | null;
        tokenInfo: ITokenInfo;
    }


    interface LiquidityPoolInfo {
        name: string;
        coin: TokenInfo;
        pc: TokenInfo;
        lp: TokenInfo;
    
        version: number;
        programId: string;
    
        ammId: string;
        ammAuthority: string;
        ammOpenOrders: string;
        ammTargetOrders: string;
        ammQuantities: string;
    
        poolCoinTokenAccount: string;
        poolPcTokenAccount: string;
        poolWithdrawQueue: string;
        poolTempLpTokenAccount: string;
    
        serumProgramId: string;
        serumMarket: string;
        serumBids?: string;
        serumAsks?: string;
        serumEventQueue?: string;
        serumCoinVaultAccount: string;
        serumPcVaultAccount: string;
        serumVaultSigner: string;
    
        official: boolean;
    
        status?: number;
        currentK?: number;
    }


    // SPL token

    interface SplTokenDisplayData {
        symbol: string;
        mint: string;
        pubkey: string;
        amount: number;
    }

    interface ISplToken {
        pubkey: string;
        parsedInfo: any;
        amount: number;
    }

    // Components props
    interface NotifyProps {
        message: {
            status: AlertStatus;
            title: string;
            description: string;
            link?: string;
        };
    }

    interface ISplTokenProps {
        splTokenData: ISplToken[];
    }

    interface TokenListProps {
        showTokenList: boolean;
        // toggleTokenList: (event?: React.MouseEvent<HTMLDivElement>) => void;
        toggleTokenList: () => void;
        getTokenInfo: Function;
    }

    // Context Types

    type DappContextType = {
        splTokens: ISplToken[] | undefined
        connection: Connection
    }
}
export {}