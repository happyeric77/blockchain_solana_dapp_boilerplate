import { TokenInfo } from "@solana/spl-token-registry";
import { useRef, useState } from "react";
import { useToken } from "../../store/tokenStore";

export default function SearchToken() {
  const { data: tokenList, isLoading } = useToken();
  const [selectedToken, setSelectedToken] = useState<TokenInfo>();
  const [filteredTokens, setFilteredTokens] = useState<TokenInfo[]>();
  const inputRef = useRef<HTMLInputElement>(null);
  function handleInput() {
    let filtered = tokenList?.filter((t) =>
      t.symbol.toUpperCase().startsWith(inputRef.current!.value.toUpperCase())
    );
    setFilteredTokens(filtered);
  }

  function handleSelectToken(token: TokenInfo) {
    setSelectedToken(token);
  }
  if (isLoading || isLoading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div
        style={{
          height: "50vh",
        }}
      >
        <div style={{ height: "50vh", overflow: "scroll" }}>
          <input
            style={{ position: "fixed" }}
            ref={inputRef}
            onChange={handleInput}
            placeholder={"Enter token symbol"}
          />
          {!isLoading && (
            <div>
              {filteredTokens &&
                filteredTokens.map((token, id) => (
                  <div key={id} onClick={() => handleSelectToken(token)}>
                    {token.symbol}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div style={{ height: "30vh" }}>
          {selectedToken && (
            <div>
              <div> Mint: {selectedToken.address}</div>
              <div>Decimal: {selectedToken.decimals}</div>
              <div>Symbol: {selectedToken.symbol}</div>
              <div>Name: {selectedToken.name}</div>
              <div>Token image: {selectedToken.logoURI}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
