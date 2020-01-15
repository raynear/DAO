import React from "react";
import { Grid, Paper, Typography, Divider, Button } from "@material-ui/core";
import { LooksOneOutlined, LooksTwoOutlined, Looks3Outlined } from "@material-ui/icons";
import clsx from "clsx";
import useStyles from "./Style";

import { selectWallet } from "./GQL";

function VerifyIcon(props: any) {
  console.log("VerifyIcon props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:{props.error.message}</p>;
  if (props.data && props.data.username) {

    if (!props.activeStep) {
      return (
        <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
          <Paper className={clsx(classes.paper, classes.center)}>
            <Grid container className={clsx(classes.container, classes.center)}>
              <Grid item className={classes.item} xs={12} md={12} lg={12}>
                <Typography>Name: {props.data.username}</Typography>
              </Grid>
              <Grid item className={classes.item} xs={12} md={12} lg={12}>
                <Typography>Verified Address: {props.verifiedAddress}</Typography>
              </Grid>
              <Grid item className={classes.item} xs={12} md={12} lg={12}>
                {props.isPRep &&
                  <>
                    <Typography>You Are PRep</Typography>
                    <Button variant="contained" color="primary" onClick={props.newPRepPage} startIcon={<Looks3Outlined />}>Make New P-Rep DAO Page</Button>
                  </>
                }
                {!props.isPRep && props.verifiedAddress !== "" && props.verifiedAddress !== "None" &&
                  <>
                    <Typography>You Are Verified</Typography>
                    <Button variant="contained" color="primary" onClick={props.addIconAddress} startIcon={<Looks3Outlined />}>Verify Icon Address</Button>
                  </>
                }
              </Grid>
              <Grid className={classes.item} item xs={12} md={12} lg={12}>
                <br />
                <Divider />
                <br />
                <Typography variant="subtitle1">Connected Address: <props.SelectedAddress /></Typography>
              </Grid>
              <Grid container className={classes.container}>
                <Grid item className={classes.item} xs={6} md={6} lg={6}>
                  <Button variant="contained" color="primary" fullWidth onClick={selectWallet} startIcon={<LooksOneOutlined />}>Verify ICON Address</Button>
                </Grid>
                <Grid item className={classes.item} xs={6} md={6} lg={6}>
                  <Button variant="contained" color="primary" fullWidth onClick={props.callVerify} startIcon={<LooksTwoOutlined />}>Check Your Verify Info</Button>
                </Grid>
              </Grid>

            </Grid>
          </Paper>
        </Grid>
      );
    } else {
      return (
        <>
          <Grid item className={classes.item} xs={12} md={12} lg={12}>
            <Typography>Name: {props.data.username}</Typography>
          </Grid>
          <Grid item className={classes.item} xs={12} md={12} lg={12}>
            <Typography>Verified Address: {props.verifiedAddress}</Typography>
          </Grid>
          <Grid item className={classes.item} xs={12} md={12} lg={12}>
            {props.isPRep &&
              <>
                <Typography>You Are PRep</Typography>
                <Button variant="contained" color="primary" onClick={props.newPRepPage} startIcon={<Looks3Outlined />}>Make New P-Rep DAO Page</Button>
              </>
            }
            {!props.isPRep && props.verifiedAddress !== "" && props.verifiedAddress !== "None" &&
              <>
                <Typography>You Are Verified</Typography>
                <Button variant="contained" color="primary" onClick={props.addIconAddress} startIcon={<Looks3Outlined />}>Verify Icon Address</Button>
              </>
            }
          </Grid>
          <Grid className={classes.item} item xs={12} md={12} lg={12}>
            <br />
            <Divider />
            <br />
            <Typography variant="subtitle1">Connected Address: <props.SelectedAddress /></Typography>
          </Grid>
          <Grid container className={classes.container}>
            <Grid item className={classes.item} xs={6} md={6} lg={6}>
              <Button variant="contained" color="primary" fullWidth onClick={selectWallet} startIcon={<LooksOneOutlined />}>Verify ICON Address</Button>
            </Grid>
            <Grid item className={classes.item} xs={6} md={6} lg={6}>
              <Button variant="contained" color="primary" fullWidth onClick={props.callVerify} startIcon={<LooksTwoOutlined />}>Check Your Verify Info</Button>
            </Grid>
          </Grid>
        </>
      );
    }

  } else {
    return <p>redirect</p>
  }
}

export default VerifyIcon;