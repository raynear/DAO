import React, { useState } from "react";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, ADD_ICON_ADDRESS, GET_VIEWER } from "./GQL";
import { jsonRpcCall, jsonRpcSendTx, governanceCall, selectedIconService } from "./IconConnect";

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
      selectNotice(1);
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

  function selectNotice(idx: number) {
    setNotice(msgForNotice[idx]);
  }

  function sendVerify(address: string) {
    client.query({ query: GET_VIEWER }).then(async (result) => {
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
        selectNotice(2);
        return;
      }
    }

    if (result_json.address) {
      addIconAddress(result_json.address);
      selectNotice(3);
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

  const queryVal = useQuery(GET_VIEWER);

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
    selectNotice={selectNotice}
  />);
}

export default VerifyIconContainer;