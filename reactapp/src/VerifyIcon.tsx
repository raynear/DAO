import React from "react";
import { Grid, Typography, Divider, Button } from "@material-ui/core";
import clsx from "clsx";
import useStyles from "./Style";

import { selectWallet } from "./GQL";

function VerifyIcon(props: any) {
  console.log("VerifyIcon props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:{props.error.message}</p>;
  if (props.data && props.data.username) {
    return (
      <>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography>Name: {props.data.username}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography>Verified Address: {props.verifiedAddress}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          {props.isPRep &&
            <>
              <Typography>You Are PRep</Typography>
              <Button variant="contained" color="primary" onClick={props.newPRepPage}>Make New P-Rep DAO Page</Button>
            </>
          }
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <br />
          <Divider />
          <br />
          <Typography variant="subtitle1">Connected Address: <props.SelectedAddress /></Typography>
        </Grid>
        <Grid className={classes.item} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" fullWidth onClick={selectWallet}>Select Wallet</Button>
        </Grid>
        <Grid className={classes.item} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" fullWidth disabled={props.iconAddress === ""} onClick={props.sendVerify}>send Verify</Button>
        </Grid>
        <Grid className={classes.item} item xs={4} md={4} lg={4}>
          <Button variant="contained" color="primary" fullWidth onClick={props.callVerify}>get Verify Info</Button>
        </Grid>
      </>
    );
  } else {
    return <p>redirect</p>
  }
}

export default VerifyIcon;