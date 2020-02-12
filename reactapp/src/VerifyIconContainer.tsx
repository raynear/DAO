import React, { useState } from "react";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, ADD_ICON_ADDRESS, VIEWER } from "./GQL";
import Transport from "@ledgerhq/hw-transport-u2f";
import Icx from "./Icx";
import { jsonRpcCall, jsonRpcSendTx, governanceCall, selectedIconService, iconService, IconConverter, IconBuilder, IconUtil } from "./IconConnect";

import { nodeURL, contractAddress } from "./Config";
import VerifyIcon from "./VerifyIcon";

function VerifyIconContainer(props: any) {
  // console.log("VerifyIconContainer props", props);
  const client = useApolloClient();

  const msgForNotice = [
    (<>{"You need to verify your address"}<br />{"Press\"(1) VERIFY ICON ADDRESS\" to verify."}</>),
    (<>{"Your verify info is sent to SCORE"}<br />{"Press\"(2) CHECK AND REGISTER\" to check & resigter."}</>),
    ("You are verified as P-Rep"),
    ("You are verified as User")
  ];

  const [notice, setNotice] = useState(msgForNotice[0]);
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [flag, setFlag] = useState(true);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [mutateNewPRep] = useMutation(NEW_PREP);
  const [mutateAddIconAddress] = useMutation(ADD_ICON_ADDRESS);

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      // console.log("response signing");
      // console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      // console.log("response json rpc");
      // console.log(payload);
      setNotice(msgForNotice[1]);
    } else if (type === "RESPONSE_ADDRESS") {
      // console.log("response!!!!", event, event.detail);
      sendVerify(payload);
      setConnectedAddress(payload);
    }
  };
  if (flag) {
    setFlag(false);
    window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);
  }

  async function sendVerifyLedger(addressIdx: number) {
    client.query({ query: VIEWER }).then(async (result) => {
      const path = "44'/4801368'/0'/0'/" + addressIdx.toString() + "'";
      const transport = await Transport.create();
      transport.setDebugMode(true);         // if you want to print log
      transport.setExchangeTimeout(60000);  // Set if you want to change U2F timeout. default: 30 sec

      const icx = new Icx(transport);
      // coin type: ICX(4801368), ICON testnet(1)
      let addressResult = await icx.getAddress(path, false, true);
      const address = addressResult.address.toString();
      // console.log("address", address);
      // console.log("balance", await iconService.getBalance(addressResult.address.toString()).execute());
      let timestamp = new Date();
      var txBuilder = new IconBuilder.CallTransactionBuilder();
      const methodName = "verify";
      const lastBlock = await iconService.getBlock('latest').execute();
      const params = { "_block_hash": lastBlock.blockHash, "_id": result.data.viewer.username };
      var txObj = txBuilder
        .from(address)
        .to(contractAddress)
        .nid(IconConverter.toBigNumber("1"))
        .version(IconConverter.toBigNumber("3"))
        .stepLimit(IconConverter.toBigNumber("10000000"))
        .timestamp(timestamp.valueOf() * 1000)
        .method(methodName)
        .params(params)
        .build();
      const rawTransaction = IconConverter.toRawTransaction(txObj);
      const hashKey = IconUtil.generateHashKey(rawTransaction);

      let { signedRawTxBase64 } = await icx.signTransaction(path, hashKey);
      rawTransaction.signature = signedRawTxBase64;

      iconService.sendTransaction({ getProperties: () => rawTransaction, getSignature: () => signedRawTxBase64 }).execute();
    })
  }

  function sendVerify(address: string) {
    client.query({ query: VIEWER }).then(async (result) => {
      // console.log("reload OK");
      const lastBlock = await selectedIconService.getBlock('latest').execute();
      const params = { "_block_hash": lastBlock.blockHash, "_id": result.data.viewer.username };

      jsonRpcSendTx(address, "verify", params);
    })
  }

  async function callVerify() {
    let result = await jsonRpcCall("get_verify_info_by_id", { "_id": queryVal.data.viewer.username });
    // console.log(queryVal.data.viewer.username, result);
    let result_json = JSON.parse(result);
    if (result_json.address) {
      setVerifiedAddress(result_json.address);
    }

    let PRepList = await governanceCall("getPReps", { "startRanking": "0x1", "endRanking": "0x60" });
    // console.log("PRepList", PRepList);
    for (let i = 0; i < PRepList.preps.length; i++) {
      const aPRep = PRepList.preps[i];
      if (aPRep.address === result_json.address) {
        setIsPRep(true);

        newPRepPage(result_json.address);
        setNotice(msgForNotice[2]);
        return;
      }
    }

    if (result_json.address) {
      addIconAddress(result_json.address);
      setNotice(msgForNotice[3]);
    }
  }

  function newPRepPage(address: string) {
    mutateNewPRep({ variables: { Address: address } }).then(() => {
      client.writeData({ data: { snack: { open: true, message: "You Are Verified as P-Rep", __typename: "snack" } } })
    });
  }

  function addIconAddress(address: string) {
    mutateAddIconAddress({ variables: { IconAddress: address } }).then((result) => {
      client.writeData({ data: { snack: { open: true, message: "You Are Verified as User!", __typename: "snack" } } })
    });
  }

  const queryVal = useQuery(VIEWER);

  return (<VerifyIcon
    {...queryVal}
    activeStep={props.activeStep}
    connectedAddress={connectedAddress}
    newPRepPage={newPRepPage}
    addIconAddress={addIconAddress}
    callVerify={callVerify}
    verifiedAddress={verifiedAddress}
    isPRep={isPRep}
    notice={notice}
  />);
}

export default VerifyIconContainer;