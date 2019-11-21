import React, { Fragment, useState } from "react";
import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";

import SignIn from "./SignIn";
//import { Typography } from "@material-ui/core";

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

function GQLSignIn({ match }: any) {
  const client = useApolloClient();

  const [redirect, setRedirect] = useState();
  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  function renderRedirect() {
    if (redirect) {
      return <Redirect to={redirect} />;
    }
  }

  function LogIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
    });
  }

  const { loading, data } = useQuery(GET_ME);

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
      <SignIn match={match} LogIn={LogIn} />
    </Fragment>
  );
}

export default GQLSignIn;
