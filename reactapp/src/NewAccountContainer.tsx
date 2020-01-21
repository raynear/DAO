import React, { useState } from "react";

import { Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";
import useForceUpdate from "./useForceUpdate";
import { SET_USER, TOKEN_AUTH } from "./GQL";
import { useMutation, useApolloClient } from "react-apollo";

import NewAccount from "./NewAccount";

function NewAccountContainer(props: any) {
  // console.log("NewAccount props", props);
  const forceUpdate = useForceUpdate();

  const client = useApolloClient();
  const [mutateSetUser] = useMutation(SET_USER);
  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  const [signInfo, setSignInfo] = useState({
    username: "",
    password: "",
    password2: ""
  });

  const [validator] = useState(new SimpleReactValidator({
    validators: {
      same: {
        message: "input same password.",
        rule: (val: any, params: any) => {
          // console.log(val, params, validator);
          for (let i = 0; i < val.length; i++) {
            for (let j = i + 1; j < val.length; j++) {
              if (val[i] !== val[j]) {
                return false;
              }
            }
          }
          return true;
        }
      },
      minpass: {
        message: "input more than :param character",
        rule: (val: any, params: any) => {
          if (val[0].length >= parseInt(params[0])) {
            return true;
          }
          return false;
        },
        messageReplace: (msg: any, params: any) => msg.replace(':param', validator.helpers.toSentence(params))
      }
    },
    locale: "en",
    className: "text-danger",
    element: (message: any, className: any) => (
      <Typography variant="caption" color="error" className={className}>
        {message}
      </Typography>
    )
  }));

  function sameValidate(val: any) {
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

  async function newUser(username: string, password: string) {
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
  }

  function logIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      // console.log(result);
      client.writeData({
        data: {
          username: username
        }
      });
    });
  }

  async function signUp() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      let result = await newUser(signInfo.username, signInfo.password);
      if (result) {
        // console.log(result);
        logIn(signInfo.username, signInfo.password);
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
    signUp={signUp}
    sameValidate={sameValidate}
  />);
}

export default NewAccountContainer;