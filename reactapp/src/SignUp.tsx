import React, { Fragment, useState } from "react";

import { Stepper, Step, StepLabel, Grid, Paper, TextField, Button, Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import useStyles from "./Style";

import GQLVerifyICON from "./GQLVerifyICON";

function SignUp(props: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Sign Up', 'Verify ICON address', 'Confirm'];

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

  async function SignUp() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      let result = await props.NewUser(signInfo.username, signInfo.password);
      if (result) {
        console.log(result);
        props.LogIn(signInfo.username, signInfo.password);
        setActiveStep(activeStep + 1);
      }
    }
  }

  function handleSignInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setSignInfo({ ...signInfo, [e.target.name]: e.target.value });
  }

  return (
    <Fragment>
      <Grid item className={classes.grid} xs={12} md={12} lg={12}>
        <Paper className={classes.paper}>
          <Grid container className={classes.container}>
            <Grid item>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
          </Grid>
          {activeStep === 0 &&
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
                  helperText={
                    SameValidate([
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
                      SignUp();
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
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <Grid container className={classes.container}>
                  <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                    <Button variant="contained" color="primary" onClick={}>
                      Back
                    </Button>
                  </Grid>
                  <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                    <Button variant="contained" color="primary" onClick={}>
                      Forward
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
          {activeStep === 1 &&
            <Grid container className={classes.container}>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <GQLVerifyICON />
              </Grid>
            </Grid>
          }
          {activeStep === 2 &&
            <Grid container className={classes.container}>
              <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                <Typography>Good Job</Typography>
              </Grid>
            </Grid>
          }
        </Paper>
      </Grid>
    </Fragment >
  );
}

export default SignUp;
