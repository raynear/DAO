import React, { Fragment, useState } from "react";
import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";

import Cookies from "js-cookie";

import Sign from "./Sign";
import { Typography } from "@material-ui/core";

const GET_ME = gql`
  query {
    me {
      username
      email
      socialAuth {
        edges {
          node {
            extraData
          }
        }
      }
    }
  }
`;

const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

const SET_USER = gql`
  mutation SetUser($username: String!, $password: String!) {
    setUser(username: $username, password: $password) {
      user {
        username
        email
      }
    }
  }
`;

function GQLSign({ match }: any) {
  const client = useApolloClient();

  const [redirect, setRedirect] = useState();
  const [mutateSignup] = useMutation(SET_USER);
  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  function renderRedirect() {
    if (redirect) {
      return <Redirect to={redirect} />;
    }
  }

  function SignUp(username: string, password: string) {
    mutateSignup({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
      setRedirect("/Sign/in");
    });
  }

  function SignIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      Cookies.set("JWT", result.data.tokenAuth.token, { expires: 7 });
      setRedirect("/");
    });
  }

  function UserDetail() {
    return <Typography>UserDetail</Typography>;
  }

  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return <p>Loading...</p>;
  //  if (error) return <p>Error!:</p>;
  if (data && data.me) {
    client.writeData({
      data: {
        username: data.me.username,
        email: data.me.email
        //photo:data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
      }
    });
  }
  console.log("GQLSign2", data);
  return (
    <Fragment>
      {renderRedirect()}
      <Sign match={match} SignUp={SignUp} SignIn={SignIn} />
    </Fragment>
  );
}

export default GQLSign;
