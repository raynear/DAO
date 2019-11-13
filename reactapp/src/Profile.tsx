import React/*, { Fragment }*/ from "react";
import {
  Grid,
  Paper,
  //  Avatar,
  Typography,
  IconButton//,
  //  Link
} from "@material-ui/core";
import { AccountCircle, Facebook } from "@material-ui/icons";

import useStyles from "./Style";

import IconService from 'icon-sdk-js';

function UserInfo(props: any) {
  const classes = useStyles();

  let photo = "";
  //  const data = props.data;

  const MAIN_NET = "http://127.0.0.1:9000/api/v3";
  const TO_CONTRACT = "cxd820466407181c1446bb96ea4a4818f97a57af4c";
  const provider = new IconService.HttpProvider(MAIN_NET);
  const icon_service = new IconService(provider);
  const IconBuilder = IconService.IconBuilder;
  const IconConverter = IconService.IconConverter;

  async function json_rpc_call(method_name: string, params: any) {
    var callBuilder = new IconBuilder.CallBuilder();
    var callObj = callBuilder
      .to(TO_CONTRACT)
      .method(method_name)
      .params(params)
      .build();
    return await icon_service.call(callObj).execute();
  }
  async function json_rpc_transaction_call(from_wallet: string, method_name: string, params: any) {
    // Need to sign or send to ICONex
    var txBuilder = new IconBuilder.CallTransactionBuilder();
    var txObj = txBuilder
      .from(from_wallet)
      .to(TO_CONTRACT)
      .method(method_name)
      .params(params)
      .build();
    return await icon_service.call(txObj).execute();
  }

  async function callLastBlock() {
    let result = await icon_service.getBlock('latest').execute();
    console.log(result.blockHash);
  }

  async function aa() {
    let result = await icon_service.getBlock('latest').execute();
    console.log(result.blockHash);

    let from_wallet = "hxe7af5fcfd8dfc67530a01a0e403882687528dfcb";
    let method_name = "Verify";
    let params = { "blockHash": result.blockHash, "id": "raynear" };

    let timestamp = new Date();
    var txBuilder = new IconBuilder.CallTransactionBuilder();
    var txObj = txBuilder
      .from(from_wallet)
      .to(TO_CONTRACT)
      .nid(IconConverter.toBigNumber("3"))
      .version(IconConverter.toBigNumber("3"))
      .stepLimit(IconConverter.toBigNumber("10000000"))
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

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      console.log("response signing");
      console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      console.log("response json rpc");
      console.log(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid className={classes.grid} item xs={4} md={4} lg={4}>
            {photo === "" &&
              <AccountCircle />
            }
            {photo !== "" &&
              <img src={photo} />
            }
          </Grid>
          <Grid className={classes.grid} item xs={8} md={8} lg={8}>
            <Typography>My Name</Typography>
          </Grid>
          <Grid>
            <IconButton href="https://localhost:8080/oauth/login/facebook">
              <Facebook />
            </IconButton>
            <IconButton href="https://localhost:8080/oauth/login/google">
              <Facebook />
            </IconButton>
            <IconButton href="https://localhost:8080/oauth/login/kakao">
              <Facebook />
            </IconButton>
            <IconButton onClick={callLastBlock}>
              <Facebook />
            </IconButton>
            <IconButton onClick={aa}>
              <Facebook />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default UserInfo;
