import React from "react";
import useStyles from "./Style";
import { Typography, Grid, Paper } from "@material-ui/core";

function LandingPage(props: any) {
  const classes = useStyles();

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography>Landing Page!!!</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default LandingPage;