import { Api, JsonRpc } from 'eosjs'
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');

const contract = 'yijiaxunkeji';

// jungle testnet
/* const network = {
  blockchain: 'eos',
  protocol: 'https',
  host: 'jungle2.cryptolions.io',  
  port: 443,
  chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
}; */

// kylin testnet
const network = {
  blockchain: 'eos',
  protocol: 'https',
  host: 'kylin.eos.dfuse.io',
  port: 443,
  chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
};

// mainnet
// const network = {
//   blockchain: 'eos',
//   protocol: 'https',
//   host: 'api.eosnewyork.io',
//   port: 80,
//   chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
// };

const defaultPrivateKey = "5JSAusb6xRiunAo5x9qCwk7MMATxLEEKHWDa5FmLpXVLoXBbCsU"; // kylin yijiaxunkeji active
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const url = network.protocol + '://' + network.host + ':' + network.port;

const rpc = new JsonRpc(url, { fetch })
const api = new Api({
  rpc,
  signatureProvider,
  chainId: network.chainId,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder(),
});

export { api, rpc, network, contract }