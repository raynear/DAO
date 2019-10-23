import React, { Fragment } from "react";
import gql from "graphql-tag";
import { useQuery, useApolloClient } from "@apollo/react-hooks";

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
  const client = useApolloClient();
  const { loading, error, data } = useQuery(GET_USER);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  console.log(data);
  if (
    !(
      data !== undefined &&
      data.hasOwnProperty("me") &&
      data.me.hasOwnProperty("socialAuth")
    )
    // &&
    //    data.me.socialAuth.hasOwnProperty("edges") &&
    //    data.me.socialAuth.edges[0].hasOwnProperty("node") &&
    //    data.me.socialAuth.edges[0].node.hasOwnProperty("extraData")
  ) {
    return <a href="http://localhost:8000/oauth/login/kakao">Login</a>;
  }
  client.writeData({
    data: {
      username: data.me.username,
      email: data.me.email,
      photo:
        data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
    }
  });
  console.log("test11111111111111111");

  //  console.log(data.me.socialAuth.edges[0].node.extraData);
  return (
    <Fragment>
      <p>{data.me.username}</p>
    </Fragment>
  );
}

export default Login;
