import SplTokenList from "../components/common/SplTokenList"
import useDapp from "../hooks/useDapp"


export default function MySplPage() {
    const {splTokens} = useDapp()
    return <>
        {splTokens && <SplTokenList splTokenData={splTokens} />}
    </>
}