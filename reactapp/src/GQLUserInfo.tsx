import React, { useMemo } from "react";
import gql from "graphql-tag";
import { useQuery, useApolloClient } from "@apollo/react-hooks";

import UserInfo from "./UserInfo";

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

function GQLUserInfo() {
  const client = useApolloClient();

  const { loading, error, data } = useQuery(GET_USER);

  useMemo(() => {
    if (data) {
      console.log(data);
      client.writeData({
        data: {
          username: data.me.username,
          email: data.me.email
          //          photo:
          //            data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
        }
      });
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  return <UserInfo data={data} />;
}

export default GQLUserInfo;
