import React, { Fragment, useState } from "react";
import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";

import Sign from "./Sign";

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

const GET_USER = gql`
  query GetUser($username: String!, $password: String!) {
    getUser(username: $username, password: $password) {
      username
      email
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
      return <Redirect to={"/"} />;
    }
  }

  function SignUp(username: string, password: string) {
    mutateSignup({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
      setRedirect(result);
    });
  }

  function SignIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
      document.cookie = "JWT" + "=" + result.data.tokenAuth.token;
    });
  }

  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  if (data && data.me) {
    client.writeData({
      data: {
        username: data.me.username,
        email: data.me.email
        //photo:data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
      }
    });
  }
  return (
    <Fragment>
      {renderRedirect()}
      <Sign match={match} SignUp={SignUp} SignIn={SignIn} />
    </Fragment>
  );
}

export default GQLSign;
