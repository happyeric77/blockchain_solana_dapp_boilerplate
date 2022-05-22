## prerequisites

Below are some key dependencies of this project

1. Chakra UI framewark
2. Solana wallet adaptor (Including adaptor-ui) to make use of sollana wallet
3. Solana web3 to interact with solana chain programs

Simply implement all neccessory packages by npm install

```
npm install
```

## Runing demo dapp

You can run test server on localhost:3000 with the boilerplate basic template by runing " npm run dev"

```
npm run dev
```

## Build UI component on top of boilerplate

You can make your own react component by

1. Adding/Editing layout components into ./components/Layout/ such as Header, footer, sider ..etc

2. Changing the style of common components by editing Loading.tsx or Notify.tsx under ./components/Common/

## Default Context provider

This boilerplate by default contains two built in context providers in ./pages/\_app.tsx:

1. WalletProvier is to take advantage of solana wallet adaptor
2. ChakraProvider is to equip the project with [Chakra UI components](https://chakra-ui.com/docs/getting-started)

## Custom hooks served with this boilerplate

1. useDapp: serves some general functionality such as setLoading, setNotify and connection
2. useAnchor: serves anchor frontend needed constants such as provider, program, signerWallet and some programIds.

# TODO

1. Dynamic adjusting exchange pool data
