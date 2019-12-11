import React, { useState } from "react";
import { Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";

import { useMutation, useApolloClient } from "@apollo/react-hooks";
import { TOKEN_AUTH } from "./GQL";

import useForceUpdate from "./useForceUpdate";
import SignIn from "./SignIn";

function SignInContainer(props: any) {
  const forceUpdate = useForceUpdate();
  const client = useApolloClient();

  const [signInfo, setSignInfo] = useState({ username: "", password: "" });

  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  function LogIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(() => {
      client.writeData({ data: { username: username } });
      props.history.push("/");
      window.location.reload();
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

  function ValidateSignIn() {
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
    <SignIn
      signInfo={signInfo}
      handleSignInfo={handleSignInfo}
      validator={validator}
      ValidateSignIn={ValidateSignIn}
    />
  );
}

export default SignInContainer;
