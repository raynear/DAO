import React, { useState } from "react";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, ADD_ICON_ADDRESS, VIEWER, GET_LOCAL_ADDRESS } from "./GQL";

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

  const [iconAddress, setIconAddress] = useState("");
  const [notice, setNotice] = useState(msgForNotice[0]);
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [mutateNewPRep] = useMutation(NEW_PREP);
  const [mutateAddIconAddress] = useMutation(ADD_ICON_ADDRESS);

  const eventHandler = async (event: any) => {
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
      client.writeData({ data: { connected_address: payload } });
      // console.log(client);
      sendVerify(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

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
    PRepList.preps.forEach((item: any, idx: number, array: any) => {
      if (item.address === result_json.address) {
        setIsPRep(true);

        newPRepPage(result_json.address);
        setNotice(msgForNotice[2]);
        return;
      }
    });
    if (result_json.address) {
      addIconAddress(result_json.address);
      setNotice(msgForNotice[3]);
    }
  }

  function SelectedAddress() {
    const { loading, error, data } = useQuery(GET_LOCAL_ADDRESS);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!:{error.message}</p>;
    if (data && data.connected_address) {
      setIconAddress(data.connected_address);
      return <>{data.connected_address}</>
    }
    return <>{" "}</>
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
    SelectedAddress={SelectedAddress}
    newPRepPage={newPRepPage}
    addIconAddress={addIconAddress}
    callVerify={callVerify}
    iconAddress={iconAddress}
    verifiedAddress={verifiedAddress}
    isPRep={isPRep}
    notice={notice}
  />);
}

export default VerifyIconContainer;