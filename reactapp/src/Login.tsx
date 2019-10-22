import React, { Fragment, useState } from "react";
import axios from "axios";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { TextField, Button } from "@material-ui/core";

import Cookies from "js-cookie";

import useStyles from "./Style";

const GET_USER = gql`
  query {
    me {
      id
      username
      email
    }
  }
`;

const GET_TOKEN = gql`
  mutation SocialAuth($provider: String!, $accessToken: String!) {
    socialAuth(provider: $provider, accessToken: $accessToken) {
      social {
        id
      }
      token
    }
  }
`;

function GetUser() {
  const { loading, error, data } = useQuery(GET_USER);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  console.log(data);
  return <p>data</p>;
}

function Login() {
  const classes = useStyles();
  const [access_token, setAccessToken] = useState("");
  const [mutateSocialAuth] = useMutation(GET_TOKEN);

  function GetToken() {
    mutateSocialAuth({
      variables: { provider: "kakao", accessToken: access_token }
    }).then(result => {
      console.log(result);
      console.log(result.data.socialAuth.token);
      Cookies.set("token", result.data.socialAuth.token);
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAccessToken(event.target.value);
  }

  return (
    <Fragment>
      <TextField
        id="access_token"
        label="access_token"
        value={access_token}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <Button
        variant="contained"
        size="medium"
        color="primary"
        className={classes.margin}
        onClick={GetToken}
      >
        GetCode2
      </Button>
      <GetUser />
    </Fragment>
  );
}

export default Login;
