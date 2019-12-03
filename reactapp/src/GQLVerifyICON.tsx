import React, { useState } from "react";
import { withRouter } from 'react-router-dom';
import { Grid, Typography, Divider, Button } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import { useQuery } from "@apollo/react-hooks";
import { GET_LOCAL_ME } from "./GQL";

import IconService from 'icon-sdk-js';
import clsx from "clsx";

import useStyles from "./Style";

function GQLVerifyICON(props: any) {
  const classes = useStyles();

  const [fromAddress, setFromAddress] = useState("");
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");

  let photo = "";
  //  const data = props.data;

  const MAIN_NET = "https://bicon.net.solidwallet.io/api/v3";
  // const MAIN_NET = "http://localhost:9000/api/v3";
  const TO_CONTRACT = "cx90cc523d941a25e5f2e704192f6b09655ccbc1ff";
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

  /*  async function callVerify2() {
      let result = await json_rpc_call("GetVerifyInfoByAddress", { "_Address": fromAddress });
      console.log(result);
    }
  */
  async function callVerify() {
    let result = await json_rpc_call("GetVerifyInfoByID", { "_ID": data.username });
    console.log(result);
    let result_json = JSON.parse(result);
    setVerifiedAddress(result_json.address);

    // const provider2 = new IconService.HttpProvider("https://ctz.solidwallet.io/api/v3");
    // const provider2 = new IconService.HttpProvider("http://localhost:9000/api/v3");
    // const icon_service2 = new IconService(provider2);

    var callBuilder = new IconBuilder.CallBuilder();
    var callObj = callBuilder
      .to("cx0000000000000000000000000000000000000000")
      .method("getPReps")
      .params({ "startRanking": "0x1", "endRanking": "0x60" })
      .build();

    let PRepList = await icon_service.call(callObj).execute();

    PRepList.preps.forEach((item: any, idx: number, array: any) => {
      console.log(item);
      if (item.address === result_json.address) {
        console.log("YOU ARE P-REP!!!!!");
        setIsPRep(true);
      }
    });

  }

  async function sendVerify() {
    let result = await icon_service.getBlock('latest').execute();

    let params = { "_BlockHash": result.blockHash, "_ID": data.username };

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

  const { loading, error, data } = useQuery(GET_LOCAL_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  let username;
  if (data === undefined) {
    username = "";
  } else {
    username = data.username;
  }
  return (
    <>
      <Grid className={classes.grid} item xs={4} md={4} lg={4}>
        {photo === "" &&
          <AccountCircle fontSize="large" />
        }
        {photo !== "" &&
          <img src={photo} alt="profile" />
        }
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>Name: {username}</Typography>
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>Verified Address: {verifiedAddress}</Typography>
      </Grid>
      <Grid className={classes.grid} item xs={8} md={8} lg={8}>
        <Typography>{isPRep}</Typography>
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

export default withRouter(GQLVerifyICON);
