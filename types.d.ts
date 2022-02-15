import { WalletContextState } from "@solana/wallet-adapter-react"
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

    interface IUpdateAmountData {
        type: string;
        amount: number;
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
        toggleTokenList: (type: "From" | "To" | undefined) => void;
        getTokenInfo: Function;
    }

    interface TokenSelectProps {
        type: string;
        toggleTokenList: Function;
        tokenData: TokenData;
        updateAmount: Function;
        wallet: Object;
        splTokenData: ISplToken[];
    }

    interface dropDownTokenListBtnProps {
        tokenData: TokenData;
    }

    interface SwapOperateContainerProps {
        toggleTokenList: Function;
        fromData: TokenData;
        toData: TokenData;
        updateAmount: Function;
        switchFromAndTo: (event?: React.MouseEvent<HTMLDivElement>) => void;
        slippageValue: number;
        sendSwapTransaction: (event?: React.MouseEvent<HTMLButtonElement>) => void;
        splTokenData: ISplToken[];
    }
    
    interface SwapDetailProps {
        title: string;
        tooltipContent: string;
        value: string;
    }

    // Context Types

    type DappContextType = {
        splTokens: ISplToken[] | undefined,
        connection: Connection,
    }
}
export {}