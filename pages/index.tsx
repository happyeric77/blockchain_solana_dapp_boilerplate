import type { NextPage } from 'next'
import SplTokenList from '../components/common/SplTokenList'
import useDapp from '../hooks/useDapp'


const Home: NextPage = () => {
  let dappData = useDapp()

  return <>
    Home Page Place holder
  </>
}

export default Home
