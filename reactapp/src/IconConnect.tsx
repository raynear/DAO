import IconService from 'icon-sdk-js';
import { nodeURL, contractAddress } from "./Config";

const ICON_NETWORK = nodeURL + "api/v3";
const CONTRACT = contractAddress;
const Provider = new IconService.HttpProvider(ICON_NETWORK);
export const iconService = new IconService(Provider);
export const IconBuilder = IconService.IconBuilder;
export const IconConverter = IconService.IconConverter;
export const IconUtil = IconService.IconUtil;

export const governanceIconService = iconService;
export const contractIconService = iconService;

export async function jsonRpcCall(methodName: string, params: any) {
  // console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to(CONTRACT)
    .method(methodName)
    .params(params)
    .build();

  // console.log(callObj);
  return await contractIconService.call(callObj).execute();
}

export async function jsonRpcSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to(CONTRACT)
    .nid(IconConverter.toBigNumber("1"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("10000000"))
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
  return await governanceIconService.call(callObj).execute();
}

export async function governanceSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to("cx0000000000000000000000000000000000000000")
    .nid(IconConverter.toBigNumber("1"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("10000000"))
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
  return await governanceIconService.call(callObj).execute();
}

export async function networkProposalSendTx(fromWallet: string, methodName: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(fromWallet)
    .to("cx0000000000000000000000000000000000000001")
    .nid(IconConverter.toBigNumber("1"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("10000000"))
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
