import React from "react";

import { Grid, TextField, Button } from "@material-ui/core";
import clsx from "clsx";

import useStyles from "./Style";


function NewAccount(props: any) {
  // console.log("NewAccount props", props);
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <TextField
          id="username"
          label="Username"
          name="username"
          type="text"
          variant="outlined"
          value={props.signInfo.username}
          onChange={props.handleSignInfo}
          helperText={props.validator.message(
            "username",
            props.signInfo.username,
            "required|min:3|alpha_num"
          )}
        />
      </Grid>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <TextField
          id="password"
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          value={props.signInfo.password}
          onChange={props.handleSignInfo}
          helperText={props.validator.message(
            "password",
            [props.signInfo.password, props.signInfo.password2],
            "required|same|minpass:6"
          )}
        />
      </Grid>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <TextField
          id="password2"
          label="Confirm Password"
          name="password2"
          type="password"
          variant="outlined"
          value={props.signInfo.password2}
          onChange={props.handleSignInfo}
          onKeyPress={e => {
            if (e.key === "Enter") {
              props.signUp();
            }
          }}
          helperText={props.validator.message(
            "password",
            [props.signInfo.password2, props.signInfo.password],
            "required|same|minpass:6"
          )}
        />
      </Grid>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <br />
        <br />
        <Button variant="contained" color="primary" onClick={props.signUp}>
          Sign up
        </Button>
        <br />
        <br />
      </Grid>
    </Grid>
  );
}

export default NewAccount;
