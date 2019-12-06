import React, { Fragment, useState } from "react";
import { useMutation, useApolloClient } from "@apollo/react-hooks";
import { TOKEN_AUTH } from "./GQL";
import gql from "graphql-tag";

import { Grid, Paper, TextField, Button, Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import useStyles from "./Style";

import clsx from "clsx";
import Cookies from "js-cookie";

function GQLSignIn(props: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();
  const client = useApolloClient();

  const [signInfo, setSignInfo] = useState({ username: "", password: "", password3: "" });

  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  function LogIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      client.writeData({ data: { username: username } });
      props.history.push("/");
    });
  }

  const validator = new SimpleReactValidator({
    validators: {
      same: {
        message: "input two password same.",
        rule: (val: any, params: any) => {
          return val[0] === val[1];
        }
      }
    },
    locale: "en",
    className: "text-danger",
    element: (message: any, className: any) => (
      <Typography variant="caption" color="error" className={className}>
        {message}
      </Typography>
    )
  });

  function SignIn() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      console.log("go to login");
      LogIn(signInfo.username, signInfo.password);
    }
  }

  function handleSignInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setSignInfo({ ...signInfo, [e.target.name]: e.target.value });
  }

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
                value={signInfo.username}
                onChange={handleSignInfo}
                helperText={validator.message(
                  "username",
                  signInfo.username,
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
                value={signInfo.password}
                onChange={handleSignInfo}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    SignIn();
                  }
                }}
                helperText={validator.message(
                  "password",
                  signInfo.password,
                  "required|min:3"
                )}
              />
            </Grid>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              <Button variant="contained" color="primary" onClick={SignIn}>
                Sign in
                </Button>
            </Grid>
            <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
              <Button
                variant="contained"
                color="secondary"
                href="https://localhost:8080/oauth/login/kakao"
              >
                Kakao Login
                </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Fragment>
  );
}

export default GQLSignIn;
