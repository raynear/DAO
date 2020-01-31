import React from "react";

import { Grid, TextField, Button, Typography } from "@material-ui/core";
import clsx from "clsx";

import useStyles from "./Style";


function EditUserInfo(props: any) {
  // console.log("Profile props", props);
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <Typography>{props.signInfo.username}</Typography>
      </Grid>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <TextField
          id="old_password"
          label="Old Password"
          name="old_password"
          type="password"
          variant="outlined"
          value={props.signInfo.oldpassword}
          onChange={props.handleSignInfo}
        />
      </Grid>
      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <TextField
          id="new_password"
          label="New Password"
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
          id="new_password2"
          label="New Password(again)"
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
        <TextField
          id="avatar"
          label="Avatar URL"
          name="avatar"
          type="text"
          variant="outlined"
          value={props.signInfo.avatar}
          onChange={props.handleSignInfo}
        />
      </Grid>

      <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
        <br />
        <br />
        <Button variant="contained" color="primary" onClick={props.changeInfo}>
          Change Info
        </Button>
        <br />
        <br />
      </Grid>
    </Grid>
  );
}

export default EditUserInfo;
