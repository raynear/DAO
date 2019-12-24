import React from "react";

import SignUp from "./SignUp";

function SignUpContainer(props: any) {
  // console.log("SingUpContainer props", props);

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Sign Up', 'Verify ICON address', 'Confirm'];

  return (<SignUp activeStep={activeStep} setActiveStep={setActiveStep} steps={steps} />)
}

export default SignUpContainer;
