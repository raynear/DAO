import React, { Fragment, useState } from "react";
import { Switch, Route } from "react-router-dom";

import { Stepper, Step, StepLabel, Grid, Paper, TextField, Button, Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import useStyles from "./Style";

import GQLProfile from "./GQLProfile";

function Sign(props: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Sign in', 'Verify ICON address', 'Confirm'];

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
      props.SignIn(signInfo.username, signInfo.password);
      setActiveStep(activeStep + 1);
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
    if (activeStep === 0) {
      return (
        <Fragment>
          <Grid item className={classes.grid} xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.container}>
                <Grid item={true}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map(label => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
                <Grid item={true} className={classes.grid} xs={12} md={12} lg={12}>
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
                    label="Password(again)"
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
    else if (activeStep === 1) {
      return (
        <Fragment>
          <Grid item className={classes.grid} xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.container}>
                <Grid item={true}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map(label => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
                <Grid item={true} className={classes.grid} xs={12} md={12} lg={12}>
                  <GQLProfile />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Grid item className={classes.grid} xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.container}>
                <Grid item={true}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map(label => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
                <Grid item={true} className={classes.grid} xs={12} md={12} lg={12}>
                  <Typography>Good Job</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Fragment>
      );
    }
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

  return (
    <Switch>
      <Route exact path="/in" component={In} />
      <Route exact path="/up" component={Up} />
    </Switch>
  )
}

export default Sign;
