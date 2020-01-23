import React from "react";
import useStyles from "./Style";
import { Typography, Grid, Paper } from "@material-ui/core";
import clsx from "clsx";
import { Player, ControlBar } from "video-react";

import './video-react.css';

function LandingPage(props: any) {
  const classes = useStyles();

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={"auto"} md={2} lg={2}>
          </Grid>
          <Grid item className={clsx(classes.paddingSide, classes.center)} xs={12} md={8} lg={8}>
            <br />
            <br />
            <Typography variant="h4" color="primary"><b>Welcome to ICON VOTE</b></Typography>
            <br />
            <br />
            <Player autoPlay>
              <source src="http://localhost:8080/static/IconVoteIntroduction.mp4" />
              <ControlBar autoHide={true} />
            </Player>
            <br />
            <br />
            <Typography variant="h5" color="textPrimary"></Typography>
            <br />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={"auto"} md={2} lg={2}>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default LandingPage;