import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, ADD_ICON_ADDRESS, VIEWER } from "./GQL";
import { jsonRpcCall, jsonRpcSendTx, governanceCall, governanceIconService } from "./IconConnect";

import VerifyIcon from "./VerifyIcon";

function VerifyIconContainer(props: any) {
  // console.log("VerifyIconContainer props", props);
  const client = useApolloClient();

  const msgForNotice = [
    "",
    "You are not Verified. Press\"VERIFY ICON ADDRESS\" to verify.",
    "If you want verify other address. Press\"VERIFY ICON ADDRESS\".",
    "You are verified as P-Rep",
    "You are verified as User"
  ];

  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState({ title: "Wait", contents: "Wait for write on ICON" });

  const [notice, setNotice] = useState(msgForNotice[0]);
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");

  const [mutateNewPRep] = useMutation(NEW_PREP);
  const [mutateAddIconAddress] = useMutation(ADD_ICON_ADDRESS);

  function sleep(t: number) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  async function waitResult(count: number, interval: number) {
    setOpen(true);
    setMsg({ title: "Wait", contents: "Verify Not exist" });

    const iconAddress = window.localStorage.getItem("iconAddress");
    for (let i = 0; i < count + 1; i++) {
      let result_json;
      try {
        const result = await jsonRpcCall("get_verify_info_by_id", { "_id": username });
        result_json = JSON.parse(result);
        if (result_json.address === iconAddress) {
          callVerify();
          setMsg({ title: "Done", contents: "Successfully Verified" });
          return;
        }
      } catch {
        if (msg.title !== "Wait" && msg.contents !== "Verify Not exist") {
          setMsg({ title: "Wait", contents: "Verify Not exist" });
        }
      } finally {
        await sleep(interval * 1000);
      }
    }
    setMsg({ title: "Fail", contents: "Verify Fail" });
  }

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      //console.log("response signing");
      //console.log(payload);
    } else if (type === "RESPONSE_JSON-RPC") {
      //console.log("response json rpc");
      //console.log(payload);
      waitResult(10, 3);
    } else if (type === "RESPONSE_ADDRESS") {
      //console.log("response!!!!", event, event.detail);
      window.localStorage.setItem("iconAddress", payload);
      sendVerify(payload);
      setConnectedAddress(payload);
    }
  };

  function selectWallet() {
    window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);
    window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_ADDRESS'
      }
    }));
  }


  useEffect(() => {
    async function CheckVerify() {
      try {
        let result = await jsonRpcCall("get_verify_info_by_id", { "_id": username });
        let result_json = JSON.parse(result);
        if (result_json.address) {
          setVerifiedAddress(result_json.address);
          selectNotice(2);
        } else {
          selectNotice(1);
        }
      } catch {
        selectNotice(1);
      }
      // console.log(username, result);
      //    console.log("callVerify verify result", result_json);
    }
    CheckVerify();
  }, [username])

  function selectNotice(idx: number) {
    setNotice(msgForNotice[idx]);
  }

  async function sendVerify(address: string) {
    // client.query({ query: VIEWER }).then(async (result) => {
    // console.log("reload OK");
    const lastBlock = await governanceIconService.getBlock('latest').execute();
    const params = { "_block_hash": lastBlock.blockHash, "_id": username };

    jsonRpcSendTx(address, "verify", params);
    // });
  }

  async function callVerify() {
    let result = await jsonRpcCall("get_verify_info_by_id", { "_id": username });
    // console.log(username, result);
    let result_json = JSON.parse(result);
    //    console.log("callVerify verify result", result_json);
    if (result_json.address) {
      setVerifiedAddress(result_json.address);
    }

    let PRepList = await governanceCall("getPReps", {});
    // console.log("PRepList", PRepList);
    for (let i = 0; i < PRepList.preps.length; i++) {
      const aPRep = PRepList.preps[i];
      if (aPRep.address === result_json.address) {
        newPRepPage(result_json.address);
        selectNotice(3);
        return;
      }
    }

    if (result_json.address) {
      addIconAddress(result_json.address);
      selectNotice(4);
    }
  }

  function newPRepPage(address: string) {
    mutateNewPRep({ variables: { Address: address } }).then(() => {
      //client.writeData({ data: { snack: { open: true, message: "You Are Verified as P-Rep", __typename: "snack" } } })
    });
  }

  function addIconAddress(address: string) {
    mutateAddIconAddress({ variables: { IconAddress: address } }).then((result) => {
      //client.writeData({ data: { snack: { open: true, message: "You Are Verified as User!", __typename: "snack" } } })
    });
  }

  const queryVal = useQuery(VIEWER, { fetchPolicy: "network-only" });
  console.log("VIEWER", queryVal);

  let _username = "";
  try {
    _username = queryVal.data.viewer.username;
  } catch{
    _username = "";
  }

  if (_username !== username) {
    setUsername(_username);
  }

  return (<VerifyIcon
    {...queryVal}
    open={open}
    setOpen={setOpen}
    msg={msg}
    activeStep={props.activeStep}
    username={username}
    connectedAddress={connectedAddress}
    verifiedAddress={verifiedAddress}
    notice={notice}
    selectNotice={selectNotice}
    waitResult={waitResult}
    selectWallet={selectWallet}
  />);
}

export default VerifyIconContainer;