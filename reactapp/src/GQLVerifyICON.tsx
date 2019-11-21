import React from "react";
import gql from "graphql-tag";
import { useQuery, useApolloClient } from "@apollo/react-hooks";

import VerifyICON from "./VerifyICON";

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


function GQLVerifyICON() {
  const client = useApolloClient();

  const { loading, data } = useQuery(GET_ME);

  if (loading) return <p>Loading...</p>;
  //  if (error) return <p>Error!:</p>;
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
  return <VerifyICON data={data} />;
}

export default GQLVerifyICON;
