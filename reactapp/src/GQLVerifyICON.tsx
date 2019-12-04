import React, { useState } from "react";
import { Grid, Typography, Divider, Button } from "@material-ui/core";
import clsx from "clsx";

import { useQuery } from "@apollo/react-hooks";
import { GET_LOCAL_ME } from "./GQL";

import { json_rpc_call, json_rpc_send_tx, governance_call, selected_icon_service, IconBuilder } from "./IconConnect";

import useStyles from "./Style";

function GQLVerifyICON(props: any) {
  const classes = useStyles();

  const [fromAddress, setFromAddress] = useState("");
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");

  let photo = "";
  //  const data = props.data;

  function selectWallet() {
    window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_ADDRESS'
      }
    }));
  }

  async function callVerify() {
    let result = await json_rpc_call("GetVerifyInfoByID", { "_ID": data.username });
    console.log(result);
    let result_json = JSON.parse(result);
    setVerifiedAddress(result_json.address);

    let PRepList = await governance_call("getPReps", { "startRanking": "0x1", "endRanking": "0x60" });

    PRepList.preps.forEach((item: any, idx: number, array: any) => {
      console.log(item);
      if (item.address === result_json.address) {
        console.log("YOU ARE P-REP!!!!!");

        setIsPRep(true);
      }
    });

  }

  async function sendVerify() {
    let result = await selected_icon_service.getBlock('latest').execute();
    let params = { "_BlockHash": result.blockHash, "_ID": data.username };

    json_rpc_send_tx(fromAddress, "Verify", params);
  }

  const { loading, error, data } = useQuery(GET_LOCAL_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:</p>;
  let username;
  if (data === undefined) {
    username = "";
  } else {
    username = data.username;
    setFromAddress(data.icon_address);
  }
  return (
    <>
      <Grid className={classes.item} item xs={12} md={12} lg={12}>
        <Typography>Name: {username}</Typography>
      </Grid>
      <Grid className={classes.item} item xs={12} md={12} lg={12}>
        <Typography>Verified Address: {verifiedAddress}</Typography>
      </Grid>
      <Grid className={classes.item} item xs={12} md={12} lg={12}>
        <Typography>{isPRep}</Typography>
      </Grid>
      <Grid className={classes.item} item xs={12} md={12} lg={12}>
        <br />
        <Divider />
        <br />
        <Typography variant="subtitle1">Connected Address: {fromAddress}</Typography>
      </Grid>
      <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" onClick={selectWallet}>Select Wallet</Button>
      </Grid>
      <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" disabled={fromAddress === ""} onClick={sendVerify}>send Verify</Button>
      </Grid>
      <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
        <Button variant="contained" color="primary" fullWidth onClick={callVerify}>get Verify Info</Button>
      </Grid>
    </>
  );
}

export default GQLVerifyICON;