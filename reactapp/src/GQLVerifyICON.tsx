import React, { useState } from "react";
import { Grid, Typography, Divider, Button } from "@material-ui/core";
import clsx from "clsx";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, GET_LOCAL_ME, GET_LOCAL_ADDRESS, selectWallet } from "./GQL";

import { json_rpc_call, json_rpc_send_tx, governance_call, selected_icon_service } from "./IconConnect";

import useStyles from "./Style";

function GQLVerifyICON(props: any) {
  //  const client = useApolloClient();
  console.log("GQLVerifyICON", props);
  const classes = useStyles();
  const [iconAddress, setIconAddress] = useState("");
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [mutateNewPRep] = useMutation(NEW_PREP);

  async function callVerify() {
    let result = await json_rpc_call("GetVerifyInfoByID", { "_ID": data.username });
    console.log(result);
    let result_json = JSON.parse(result);
    setVerifiedAddress(result_json.address);

    //    let PRepList = await governance_call("getPReps", { "startRanking": "0x1", "endRanking": "0x60" });
    const result2 = JSON.parse(`{
      "result": {
        "blockHeight": "0x1234",
        "startRanking": "0x1",
        "totalDelegated": "0x2863c1f5cdae42f9540000000",
        "totalStake": "0x193e5939a08ce9dbd480000000",
        "preps": [
          {
            "name": "Banana node",
            "country": "KOR",
            "city": "Seoul",
            "grade": "0x0",
            "address": "hx8f21e5c54f006b6a5d5fe65486908592151a7c57",
            "irep": "0xc350",
            "irepUpdateBlockHeight": "0x1200",
            "lastGenerateBlockHeight": "-0x1",
            "stake": "0x21e19e0c9bab2400000",
            "delegated": "0x204fce5e3e25026110000000",
            "totalBlocks": "0x2710",
            "validatedBlocks": "0x2328"
          },
          {
            "name": "ABC Node",
            "country": "USA",
            "city": "New York",
            "grade": "0x0",
            "address": "hx1d6463e4628ee52a7f751e9d500a79222a7f3935",
            "irep": "0xc350",
            "irepUpdateBlockHeight": "0x1100",
            "lastGenerateBlockHeight": "0x1200",
            "stake": "0x28a857425466f800000",
            "delegated": "0x9ed194db19b238c000000",
            "totalBlocks": "0x2720",
            "validatedBlocks": "0x2348"
          },
          {
            "name": "Raynear",
            "country": "KOR",
            "city": "Yong in",
            "grade": "0x0",
            "address": "hxd1a3147ac75edc40d1094b8ec4f6a2bbd77ffbd4",
            "irep": "0xc350",
            "irepUpdateBlockHeight": "0x1100",
            "lastGenerateBlockHeight": "0x1200",
            "stake": "0x28a857425466f800000",
            "delegated": "0x9ed194db19b238c000000",
            "totalBlocks": "0x2720",
            "validatedBlocks": "0x2348"
          },
          {
            "name": "NewPRepTest",
            "country": "KOR",
            "city": "Seoul",
            "grade": "0x0",
            "address": "hxe7af5fcfd8dfc67530a01a0e403882687528dfcb",
            "irep": "0xc350",
            "irepUpdateBlockHeight": "0x1100",
            "lastGenerateBlockHeight": "0x1200",
            "stake": "0x28a857425466f800000",
            "delegated": "0x9ed194db19b238c000000",
            "totalBlocks": "0x2720",
            "validatedBlocks": "0x2348"
          }

        ]
      }
    }`)

    result2.result.preps.forEach((item: any, idx: number, array: any) => {
      if (item.address === result_json.address) {
        setIsPRep(true);
        return;
      }
    });
  }

  async function sendVerify() {
    let result = await selected_icon_service.getBlock('latest').execute();
    let params = { "_BlockHash": result.blockHash, "_ID": data.username };

    json_rpc_send_tx(iconAddress, "Verify", params);
  }

  function SelectedAddress() {
    const { loading, error, data } = useQuery(GET_LOCAL_ADDRESS);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!:{error.message}</p>;
    if (data && data.icon_address) {
      setIconAddress(data.icon_address);
      return <p>{data.icon_address}</p>
    }
    return <p>{" "}</p>
  }

  function newPRepPage() {
    mutateNewPRep({ variables: { PRepAddress: verifiedAddress, OwnerId: data.username, Description: data.username } }).then(() => {
      props.setActiveStep(2);
    });
  }

  const { loading, error, data } = useQuery(GET_LOCAL_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error.message}</p>;
  if (data && data.username) {
    return (
      <>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography>Name: {data.username}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography>Verified Address: {verifiedAddress}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          {isPRep &&
            <>
              <Typography>You Are PRep</Typography>
              <Button onClick={newPRepPage}>Make New P-Rep DAO Page</Button>
            </>
          }
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <br />
          <Divider />
          <br />
          <Typography variant="subtitle1">Connected Address: <SelectedAddress /></Typography>
        </Grid>
        <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" onClick={selectWallet}>Select Wallet</Button>
        </Grid>
        <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" disabled={iconAddress === ""} onClick={sendVerify}>send Verify</Button>
        </Grid>
        <Grid className={clsx(classes.item, classes.center)} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" fullWidth onClick={callVerify}>get Verify Info</Button>
        </Grid>
      </>
    );
  } else {
    props.history.push('/Signup');
    return <p>redirect</p>
  }
}

export default GQLVerifyICON;