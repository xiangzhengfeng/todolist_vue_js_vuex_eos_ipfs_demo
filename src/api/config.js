import { Api, JsonRpc } from 'eosjs'
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');

/* 
import ScatterJS from 'scatterjs-core'
import ScatterEOS from 'scatterjs-plugin-eosjs2' */

const contract = 'sichuanyijia';

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

// local
// const network = {
//   blockchain: 'eos',
//   protocol: 'http',
//   host: '127.0.0.1',
//   port: 8888,
//   chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
// };

// mainnet
// const network = {
//   blockchain: 'eos',
//   protocol: 'https',
//   host: 'api.eosnewyork.io',
//   port: 80,
//   chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
// };

/* 
ScatterJS.plugins(new ScatterEOS()); */

//const defaultPrivateKey = "5JiyMJSXARNYiUPoAmpDcBVmD9xCHXRUFwNPqaT4MVrENE46FJq"; // jungle  xiangzhengfe
//const defaultPrivateKey = "5K6ntG33ymzBwinpXStJKqh7T5AaE2hPn86hT6M4DdwcDwUSsAr"; // kylin zijizhanghao
const defaultPrivateKey = "5K9oW68nszwibv5zDRkLzTUwPPBMJtrFz8tTT8uxmAeXZ3akHN2"; // kylin sichuanyijia
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
//const signatureProvider = ScatterJS.scatter.eosHook(network, null, true);
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