import React from "react";
import { Stepper, Step, StepLabel, Grid, Paper, Button, Typography } from "@material-ui/core";
import clsx from "clsx";

import useStyles from "./Style";

import VerifyIconContainer from "./VerifyIconContainer";
import NewAccountContainer from "./NewAccountContainer";

function SignUp(props: any) {
  console.log("SingUp props", props);
  const classes = useStyles();

  return (
    <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
      <Paper className={clsx(classes.paper, classes.center)}>
        <Grid container className={clsx(classes.container, classes.center)}>
          <Grid item className={clsx(classes.item, classes.center)} xs={12} md={12} lg={12}>
            <br />
            <Stepper activeStep={props.activeStep} alternativeLabel>
              {props.steps.map((label: any) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <br />
            <br />
          </Grid>
        </Grid>
        {props.activeStep === 0 &&
          <NewAccountContainer activeStep={props.activeStep} setActiveStep={props.setActiveStep} />
        }
        {props.activeStep === 1 &&
          <VerifyIconContainer activeStep={props.activeStep} setActiveStep={props.setActiveStep} />
        }
        {props.activeStep === 2 &&
          <Grid container className={classes.container}>
            <Grid item className={classes.item} xs={12} md={12} lg={12}>
              <br />
              <br />
              <br />
              <br />
              <Typography>Good Job</Typography>
              <br />
              <br />
              <br />
              <br />
            </Grid>
          </Grid>
        }
        <Grid container className={classes.container}>
          <Grid item className={clsx(classes.item, classes.left)} xs={6} md={6} lg={6}>
            <Button variant="contained" color="primary" onClick={() => { props.setActiveStep(props.activeStep - 1) }} disabled={props.activeStep <= 0} >
              Back
            </Button>
          </Grid>
          <Grid item className={clsx(classes.item, classes.right)} xs={6} md={6} lg={6}>
            <Button variant="contained" color="primary" onClick={() => { props.setActiveStep(props.activeStep + 1) }} disabled={props.activeStep >= 2}>
              Forward
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default SignUp;
