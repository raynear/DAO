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

  function logIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(() => {
      client.writeData({ data: { username: username } });
      client.writeData({ data: { snack: { open: true, message: "Welcome " + username, __typename: "snack" } } });
      props.history.go(-1);
      // window.location.reload();
    });
  }

  const [validator] = useState(new SimpleReactValidator({
    validators: {},
    locale: "en",
    className: "text-danger",
    element: (message: any, className: any) => (
      <Typography variant="caption" color="error" className={className}>
        {message}
      </Typography>
    )
  }));

  function validateSignIn() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    } else {
      // console.log("go to login");
      logIn(signInfo.username, signInfo.password);
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
      validateSignIn={validateSignIn}
    />
  );
}

export default SignInContainer;
