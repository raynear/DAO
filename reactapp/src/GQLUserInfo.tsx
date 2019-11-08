import React from "react";
import gql from "graphql-tag";
import { useQuery, useApolloClient } from "@apollo/react-hooks";

import UserInfo from "./UserInfo";

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

function GQLUserInfo() {
  const client = useApolloClient();

  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return <p>Loading...</p>;
  //  if (error) return <p>Error!:</p>;
  if (data && data.me) {
    console.log("GQLUserInfo", data);
    client.writeData({
      data: {
        username: data.me.username,
        email: data.me.email
        //photo:data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
      }
    });
  }
  return <UserInfo data={data} />;
}

export default GQLUserInfo;
