import React, { Fragment } from "react";
import { Grid, Paper, TextField, Button } from "@material-ui/core";
import clsx from "clsx";

import useStyles from "./Style";

function SignIn(props: any) {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
        <Paper className={classes.paper}>
          <Grid container className={classes.container}>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              <TextField
                id="username"
                label="User Name"
                name="username"
                type="text"
                value={props.signInfo.username}
                onChange={props.handleSignInfo}
                helperText={props.validator.message(
                  "username",
                  props.signInfo.username,
                  "required|min:3"
                )}
              />
            </Grid>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              <TextField
                id="password"
                label="Password"
                name="password"
                type="password"
                value={props.signInfo.password}
                onChange={props.handleSignInfo}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    props.validateSignIn();
                  }
                }}
                helperText={props.validator.message(
                  "password",
                  props.signInfo.password,
                  "required|min:3"
                )}
              />
            </Grid>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              <Button variant="contained" color="primary" onClick={props.validateSignIn}>
                Sign in
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Fragment>
  );
}

export default SignIn;