import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Wallet } from '../components/common/WalletProvider'
import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../components/layout/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return <ChakraProvider>
    <Wallet>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Wallet>
  </ChakraProvider>
}

export default MyApp
