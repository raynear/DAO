import React, { Fragment, useState } from "react";
import { Grid, Paper, TextField, Button, Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import useStyles from "./Style";

function Sign(props: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  const [signInfo, setSignInfo] = useState({
    username: "",
    password: "",
    password2: ""
  });

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

  function SameValidate(val: any) {
    if (val[0] === val[1]) {
      return;
    } else {
      return (
        <Typography variant="caption" color="error">
          Have to be same.
        </Typography>
      );
    }
  }

  function SignUp() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      props.SignUp(signInfo.username, signInfo.password);
    }
  }

  function SignIn() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      props.SignIn(signInfo.username, signInfo.password);
    }
  }

  function handleSignInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setSignInfo({ ...signInfo, [e.target.name]: e.target.value });
  }

  function Up() {
    return (
      <Fragment>
        <Grid item className={classes.grid} xs={12} md={12} lg={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.container}>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
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
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <TextField
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  value={signInfo.password}
                  onChange={handleSignInfo}
                  helperText={SameValidate([
                    signInfo.password,
                    signInfo.password2
                  ])}
                />
              </Grid>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <TextField
                  id="password2"
                  label="Password2"
                  name="password2"
                  type="password"
                  value={signInfo.password2}
                  onChange={handleSignInfo}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      SignIn();
                    }
                  }}
                  helperText={SameValidate([
                    signInfo.password,
                    signInfo.password2
                  ])}
                />
              </Grid>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <Button variant="contained" color="primary" onClick={SignUp}>
                  Sign up
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Fragment>
    );
  }

  function In() {
    return (
      <Fragment>
        <Grid item className={classes.grid} xs={12} md={12} lg={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.container}>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
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
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
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
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <Button variant="contained" color="primary" onClick={SignIn}>
                  Sign in
                </Button>
              </Grid>
              <Grid item className={classes.grid} xs={12} md={12} lg={6}>
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

  if (props.match.params.type.toLowerCase() === "in") {
    return In();
  } else if (props.match.params.type.toLowerCase() === "up") {
    return Up();
  } else {
    return <div> </div>;
  }
}

export default Sign;
