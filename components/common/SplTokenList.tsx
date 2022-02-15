import { FunctionComponent, useEffect, useState } from "react";
import { TOKENS } from "../../utils/tokens";
import style from "../../styles/splTokenList.module.sass"

const SplTokenList: FunctionComponent<ISplTokenProps> = ( props ): JSX.Element => {
  const [tokenList, setTokenList] = useState<SplTokenDisplayData[]>([]);
  
  useEffect(()=>{
    console.log("GG")
    setTokenList(updateTokenList())
  }, [])
  
  function updateTokenList(): SplTokenDisplayData[] {
    let tokenList = [];
    for (const [_, value] of Object.entries(TOKENS)) {
      let spl: ISplToken | undefined = props.splTokenData.find(
        (t: ISplToken) => t.parsedInfo.mint === value.mintAddress
      );
      
      if (spl) {
        let token = {} as SplTokenDisplayData;
        token["symbol"] = value.symbol;
        token["mint"] = spl?.parsedInfo.mint;
        token["pubkey"] = spl?.pubkey;
        token["amount"] = spl?.amount;
        tokenList.push(token);
      }
    }
    return tokenList
  }
  
  return (
    <div className={style.splTokenList}>
      {tokenList.map((item ) => {
        return (
          <div key={item.mint} className={style.item}  >
            <div>
              <span style={{ marginRight: "1rem", fontWeight: "600" }}>
                {item.symbol}
              </span>
              <span>- {item.amount}</span>
            </div>
            <div style={{ opacity: ".25" }}>
              <div>Mint: {item.mint}</div>
              <div>Pubkey: {item.pubkey}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SplTokenList;
