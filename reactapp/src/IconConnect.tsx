import IconService from 'icon-sdk-js';

const MAINNET = "https://ctz.solidwallet.io/api/v3";
// const MAINCONTRACT = "cx_main_net_contract";
const TESTNET = "https://bicon.net.solidwallet.io/api/v3"
//const TESTCONTRACT = "cx938d363b50736607821a7f0346d0fb4f8e2a2514";
const LOCALNET = "http://ec2-52-79-207-139.ap-northeast-2.compute.amazonaws.com:9000/api/v3";
const LOCALCONTRACT = "cx15695d9cde317a272ed419f8234148af4304594c";
const mainProvider = new IconService.HttpProvider(MAINNET);
export const mainIconService = new IconService(mainProvider);
const localProvider = new IconService.HttpProvider(LOCALNET);
export const localIconService = new IconService(localProvider);
const testProvider = new IconService.HttpProvider(TESTNET);
export const testIconService = new IconService(testProvider);
export const IconBuilder = IconService.IconBuilder;
export const IconConverter = IconService.IconConverter;

const SELECTEDCONTRACT = LOCALCONTRACT;
export const selectedIconService = localIconService

export async function jsonRpcCall(method_name: string, params: any) {
  // console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to(SELECTEDCONTRACT)
    .method(method_name)
    .params(params)
    .build();

  // console.log(callObj);
  return await selectedIconService.call(callObj).execute();
}

export async function jsonRpcSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to(SELECTEDCONTRACT)
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(methodName)
    .params(params)
    .build();
  const scoreData = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "icx_sendTransaction",
    "params": IconConverter.toRawTransaction(txObj),
    "id": 0
  });

  const parsed = JSON.parse(scoreData);
  const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", {
    detail: {
      type: 'REQUEST_JSON-RPC',
      payload: parsed
    }
  }
  );
  window.dispatchEvent(customEvent);
}

export async function governanceCall(methodName: string, params: any) {
  // console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to("cx0000000000000000000000000000000000000000")
    .method(methodName)
    .params(params)
    .build();

  // console.log(callObj);
  return await selectedIconService.call(callObj).execute();
}

export async function governanceSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to("cx0000000000000000000000000000000000000000")
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(methodName)
    .params(params)
    .build();
  const scoreData = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "icx_sendTransaction",
    "params": IconConverter.toRawTransaction(txObj),
    "id": 0
  });

  const parsed = JSON.parse(scoreData);
  const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", {
    detail: {
      type: 'REQUEST_JSON-RPC',
      payload: parsed
    }
  }
  );
  window.dispatchEvent(customEvent);
}

export async function networkProposalCall(methodName: string, params: any) {
  // console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to("cx0000000000000000000000000000000000000001")
    .method(methodName)
    .params(params)
    .build();

  // console.log(callObj);
  return await selectedIconService.call(callObj).execute();
}

export async function networkProposalSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to("cx0000000000000000000000000000000000000001")
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(methodName)
    .params(params)
    .build();
  const scoreData = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "icx_sendTransaction",
    "params": IconConverter.toRawTransaction(txObj),
    "id": 0
  });

  const parsed = JSON.parse(scoreData);
  const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", {
    detail: {
      type: 'REQUEST_JSON-RPC',
      payload: parsed
    }
  }
  );
  window.dispatchEvent(customEvent);
}
