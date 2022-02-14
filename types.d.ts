
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

    type DappContextType = {
        splTokens: ISplToken[] | undefined
    }
}
export {}