import React from "react";
import gql from "graphql-tag";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";

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

const LOG_OUT = gql`
  mutation Logout {
    logout {
      noop
    }
  }
`;

function GQLUserInfo() {
  const client = useApolloClient();

  const [mutateLogout] = useMutation(LOG_OUT);

  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  if (data && data.me) {
    console.log("GQLUserInfo", data);
    let photo = "";
    try {
      if (
        data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
      ) {
        photo =
          data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage;
      }
    } catch {
      console.log("no social login");
    }
    client.writeData({
      data: {
        username: data.me.username,
        email: data.me.email,
        photo: photo
      }
    });
  }
  return <UserInfo data={data} Logout={mutateLogout} />;
}

export default GQLUserInfo;
