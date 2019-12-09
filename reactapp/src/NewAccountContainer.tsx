import React, { useState } from "react";

import { Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";
import useForceUpdate from "./useForceUpdate";
import { SET_USER, TOKEN_AUTH } from "./GQL";
import { useMutation, useApolloClient } from "react-apollo";

import NewAccount from "./NewAccount";

function NewAccountContainer(props: any) {
  console.log("NewAccount props", props);
  const forceUpdate = useForceUpdate();

  const client = useApolloClient();
  const [mutateSetUser] = useMutation(SET_USER);
  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

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

  async function NewUser(username: string, password: string) {
    try {
      await mutateSetUser({
        variables: { username: username, password: password }
      })
    }
    catch (e) {
      if (e.toString().indexOf("UNIQUE")) {
        alert("id exist. make another id")
      }
      return false;
    }
    return true;
    /*.then(result => {
      console.log(result);
    }).catch(e => {
      console.log("error?", e);
      if (e.toString().indexOf("UNIQUE")) {
        alert("id exist. make another id")
        return false;
      }
    });*/
  }

  function LogIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
      client.writeData({
        data: {
          username: username
        }
      });
    });
  }

  async function SignUp() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      let result = await NewUser(signInfo.username, signInfo.password);
      if (result) {
        console.log(result);
        LogIn(signInfo.username, signInfo.password);
        props.setActiveStep(props.activeStep + 1);
      }
    }
  }

  function handleSignInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setSignInfo({ ...signInfo, [e.target.name]: e.target.value });
  }

  return (<NewAccount
    signInfo={signInfo}
    handleSignInfo={handleSignInfo}
    validator={validator}
    SignUp={SignUp}
    SameValidate={SameValidate}
  />);
}

export default NewAccountContainer;