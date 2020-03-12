import React from "react";
import { Grid, Paper, Typography, Divider, Button, Dialog, DialogTitle, CircularProgress } from "@material-ui/core";
import clsx from "clsx";
import useStyles from "./Style";

import LedgerDialogContainer from "./LedgerDialogContainer";

function VerifyIcon(props: any) {
  // console.log("VerifyIcon props", props);
  const classes = useStyles();

  function Contents() {
    return (
      <>
        <Dialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={props.open}
        >
          <DialogTitle>{props.msg.title}</DialogTitle>
          <Grid container className={classes.grid}>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              {props.msg.title === "Wait" &&
                <CircularProgress />
              }
              <Typography variant="h5" color="textPrimary">{props.msg.contents}</Typography>
            </Grid>
            <Grid item className={classes.item} xs={12} md={12} lg={12}>
              <Button variant="contained" color="primary" fullWidth onClick={() => props.setOpen(false)}>
                Close
            </Button>
            </Grid>
          </Grid>
        </Dialog>
        <Grid item className={classes.item} xs={12} md={12} lg={12}>
          <Typography variant="h5" color="textPrimary">{props.username}</Typography>
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
            <Button variant="contained" color="primary" fullWidth onClick={props.selectWallet} >Verify ICON Address(IconEX)</Button>
          </Grid>
          <Grid item className={classes.item} xs={6} md={6} lg={6}>
            <LedgerDialogContainer selectNotice={props.selectNotice} waitResult={props.waitResult} />
          </Grid>
        </Grid>
      </>
    );
  }

  if (props.loading) return <div style={{ textAlign: "center" }}><CircularProgress /></div>;
  if (props.error) return <p>Error!:{props.error.message}</p>;
  if (!props.activeStep) {
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
}

export default VerifyIcon;