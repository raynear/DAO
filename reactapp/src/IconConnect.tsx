import IconService from 'icon-sdk-js';

const MAIN_NET = "https://ctz.solidwallet.io/api/v3";
// const MAIN_CONTRACT = "cx_main_net_contract";
const TEST_NET = "https://bicon.net.solidwallet.io/api/v3"
const TEST_CONTRACT = "cx7b2ce19fc7e18aad7df3ff72a0328a4af2f06360";
const LOCAL_NET = "http://localhost:9000/api/v3";
const LOCAL_CONTRACT = "cx21392744c7331bac9288e9c2b03e9344dfaf1fd9";
const main_provider = new IconService.HttpProvider(MAIN_NET);
export const main_icon_service = new IconService(main_provider);
const local_provider = new IconService.HttpProvider(LOCAL_NET);
export const local_icon_service = new IconService(local_provider);
const test_provider = new IconService.HttpProvider(TEST_NET);
export const test_icon_service = new IconService(test_provider);
export const IconBuilder = IconService.IconBuilder;
export const IconConverter = IconService.IconConverter;

const SELECTED_CONTRACT = LOCAL_CONTRACT;
export const selected_icon_service = local_icon_service

export async function json_rpc_call(method_name: string, params: any) {
  console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to(SELECTED_CONTRACT)
    .method(method_name)
    .params(params)
    .build();

  console.log(callObj);
  return await selected_icon_service.call(callObj).execute();
}

export async function json_rpc_send_tx(from_wallet: string, method_name: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(from_wallet)
    .to(SELECTED_CONTRACT)
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(method_name)
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

export async function governance_call(method_name: string, params: any) {
  console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to("cx0000000000000000000000000000000000000000")
    .method(method_name)
    .params(params)
    .build();

  console.log(callObj);
  return await selected_icon_service.call(callObj).execute();
}

export async function governance_send_tx(from_wallet: string, method_name: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(from_wallet)
    .to("cx0000000000000000000000000000000000000000")
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(method_name)
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

export async function network_proposal_call(method_name: string, params: any) {
  console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to("cx0000000000000000000000000000000000000001")
    .method(method_name)
    .params(params)
    .build();

  console.log(callObj);
  return await selected_icon_service.call(callObj).execute();
}

export async function network_proposal_send_tx(from_wallet: string, method_name: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(from_wallet)
    .to("cx0000000000000000000000000000000000000001")
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(method_name)
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
