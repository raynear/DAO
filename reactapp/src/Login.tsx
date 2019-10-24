import React from "react";
import gql from "graphql-tag";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { Avatar } from "@material-ui/core";

import useStyles from "./Style";

const GET_USER = gql`
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

function Login() {
  const classes = useStyles();
  const client = useApolloClient();
  const { loading, error, data } = useQuery(GET_USER);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  if (
    !(
      data !== undefined &&
      data.hasOwnProperty("me") &&
      data.me.hasOwnProperty("socialAuth") &&
      data.me.socialAuth.hasOwnProperty("edges") &&
      data.me.socialAuth.edges.length > 0
    )
    //    data.me.socialAuth.edges[0].hasOwnProperty("node") &&
    //    data.me.socialAuth.edges[0].node.hasOwnProperty("extraData")
  ) {
    return <a href="http://localhost:8000/oauth/login/kakao">Login</a>;
  } else {
    client.writeData({
      data: {
        username: data.me.username,
        email: data.me.email,
        photo:
          data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
      }
    });

    //  console.log(data.me.socialAuth.edges[0].node.extraData);
    return (
      <Avatar
        alt={data.me.username}
        src={
          data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
        }
        className={classes.noMarginPadding}
      />
    );
  }
}

export default Login;
