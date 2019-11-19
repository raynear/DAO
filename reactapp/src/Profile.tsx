import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  Button
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import IconService from 'icon-sdk-js';
import clsx from "clsx";

import useStyles from "./Style";

const ASK_VERIFY = gql`
mutation AskVerify($targetAddress:String!){
  askVerify(targetAddress:$targetAddress){
    noop
  }
}
`;

function Profile(props: any) {
  const classes = useStyles();

  const [fromAddress, setFromAddress] = useState("");
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [verifyInfo, setVerifyInfo] = useState();

  const [askVerify] = useMutation(ASK_VERIFY, { variables: { targetAddress: fromAddress } });

  let photo = "";
  //  const data = props.data;

  //  const MAIN_NET = "https://bicon.net.solidwallet.io/api/v3";
  const MAIN_NET = "http://localhost:9000/api/v3";
  const TO_CONTRACT = "cxf902c266429235e3849042f6104f57b06e868212";
  const provider = new IconService.HttpProvider(MAIN_NET);
  const icon_service = new IconService(provider);
  const IconBuilder = IconService.IconBuilder;
  const IconConverter = IconService.IconConverter;

  async function json_rpc_call(method_name: string, params: any) {
    console.log("params", params);
    var callBuilder = new IconBuilder.CallBuilder();
    var callObj = callBuilder
      .to(TO_CONTRACT)
      .method(method_name)
      .params(params)
      .build();

    console.log(callObj);
    return await icon_service.call(callObj).execute();
  }
  async function json_rpc_transaction_call(from_wallet: string, method_name: string, params: any) {
    let timestamp = new Date();
    var txBuilder = new IconBuilder.CallTransactionBuilder();
    var txObj = txBuilder
      .from(from_wallet)
      .to(TO_CONTRACT)
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

  function selectWallet() {
    window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_ADDRESS'
      }
    }));
  }

  async function AskVerify() {
    let result = await askVerify()
    console.log(result);
  }

  /*  async function callVerify2() {
      let result = await json_rpc_call("GetVerifyInfoByAddress", { "_Address": fromAddress });
      console.log(result);
    }
  */
  async function callVerify() {
    let result = await json_rpc_call("GetVerifyInfoByID", { "_ID": props.data.me.username });
    console.log(result);
    let result_json = JSON.parse(result);
    setVerifiedAddress(result_json.address);
    setVerifyInfo(result_json.confirmed);
  }

  async function sendVerify() {
    let result = await icon_service.getBlock('latest').execute();

    let params = { "_BlockHeight": result.height.toString(), "_BlockHash": result.blockHash, "_ID": "raynear" };

    json_rpc_transaction_call(fromAddress, "Verify", params);
  }

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      console.log("response signing");
      console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      console.log("response json rpc");
      console.log(payload);
    } else if (type === "RESPONSE_ADDRESS") {
      setFromAddress(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  return (
    <>
      <Grid className={classes.grid} item xs={4} md={4} lg={4}>
        {photo === "" &&
          <AccountCircle fontSize="large" />
        }
        {photo !== "" &&
          <img src={photo} />
        }
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>Name: {props.data.me.username}</Typography>
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>Verified Address: {verifiedAddress}</Typography>
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>is Verified: {String(verifyInfo)}</Typography>
      </Grid>
      <Grid className={classes.grid} item xs={12} md={12} lg={12}>
        <br />
        <Divider />
        <br />
        <Typography variant="subtitle1">Connected Address: {fromAddress}</Typography>
      </Grid>
      <Grid className={clsx(classes.grid, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" onClick={selectWallet}>Select Wallet</Button>
      </Grid>
      <Grid className={clsx(classes.grid, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" disabled={fromAddress === ""} onClick={sendVerify}>send Verify</Button>
      </Grid>
      <Grid className={clsx(classes.grid, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" fullWidth onClick={callVerify}>get Verify Info</Button>
      </Grid>
    </>
  );
}

export default Profile;

/*
href="https://localhost:8080/oauth/login/facebook"
href="https://localhost:8080/oauth/login/google"
href="https://localhost:8080/oauth/login/kakao"
*/