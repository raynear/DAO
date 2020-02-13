import React, { useState } from "react";
import { Grid, Paper, Typography, Divider, Button } from "@material-ui/core";
import { LooksOneOutlined, LooksTwoOutlined } from "@material-ui/icons";
import clsx from "clsx";
import useStyles from "./Style";

import { selectWallet } from "./GQL";
import LedgerDialogContainer from "./LedgerDialogContainer";

function VerifyIcon(props: any) {
  // console.log("VerifyIcon props", props);
  const classes = useStyles();

  function Contents() {
    return (
      <>
        <Grid item className={classes.item} xs={12} md={12} lg={12}>
          <Typography variant="h5" color="textPrimary">{props.data.viewer.username}</Typography>
        </Grid>
        <Grid item className={classes.item} xs={12} md={12} lg={12}>
          <Typography variant="h6" color="textPrimary">Verified Address: {props.verifiedAddress}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography variant="subtitle1" color="textSecondary">Connected Address: {props.connectedAddress}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <br />
          <br />
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <Typography variant="h6" color="primary">{props.notice}</Typography>
        </Grid>
        <Grid className={classes.item} item xs={12} md={12} lg={12}>
          <br />
          <Divider />
          <br />
        </Grid>
        <Grid container className={classes.container}>
          <Grid item className={classes.item} xs={6} md={6} lg={6}>
            <Button variant="contained" color="primary" fullWidth onClick={selectWallet} startIcon={<LooksOneOutlined />}>Verify ICON Address</Button>
          </Grid>
          <Grid item className={classes.item} xs={6} md={6} lg={6}>
            <Button variant="contained" color="primary" fullWidth onClick={props.callVerify} startIcon={<LooksTwoOutlined />}>Check and Register</Button>
          </Grid>
        </Grid>
        <LedgerDialogContainer />
      </>
    );
  }

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:{props.error.message}</p>;
  if (props.data && props.data.viewer.username) {

    if (!props.activeStep) {
      // props.callVerify();
      return (
        <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
          <Paper className={clsx(classes.paper, classes.center)}>
            <Grid container className={clsx(classes.container, classes.center)}>
              <Contents />
            </Grid>
          </Paper>
        </Grid>
      );
    } else {
      return (
        <Contents />
      );
    }

  } else {
    return <p>redirect</p>
  }
}

export default VerifyIcon;