import React from "react";
import { BrowserRouter } from "react-router-dom";

import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import { GET_LOCAL_ME } from "./GQL";
import Cookies from "js-cookie";

import Layout from "./Layout";

const client = new ApolloClient({
  uri: "https://localhost:8080/graphql/",
  // tell apollo to include credentials for csrf token protection
  credentials: "include",
  // async operation with fetch to get csrf token
  request: async operation => {
    let csrf = Cookies.get("csrftoken");
    if (csrf === undefined) {
      let csrftoken = await fetch("https://localhost:8080/csrf/")
        .then(response => response.json())
        .then(data => data.csrfToken);
      // set the cookie 'csrftoken'
      Cookies.set("csrftoken", csrftoken);
      csrf = csrftoken;
    }
    operation.setContext({
      // set the 'X-CSRFToken' header to the csrftoken
      headers: {
        "X-CSRFToken": csrf
      }
    });
  },
  cache: new InMemoryCache(),
  clientState: {
    defaults: {
      data: { username: "", email: "", photo: "", icon_address: "", __typename: "user" }
    },
    resolvers: {},
    typeDefs: ``
  }
});

function App(props: any) {

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      console.log("response signing");
      console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      console.log("response json rpc");
      console.log(payload);
    } else if (type === "RESPONSE_ADDRESS") {
      client.writeData({ data: { icon_address: payload } });
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  client.query({ query: gql`{ viewer{ username iconAddress }}` }).then((result: any) => {
    client.writeData({ data: { username: result.data.viewer.username, icon_address: result.data.viewer.iconAddress } });
    client.query({ query: GET_LOCAL_ME }).then(result => {
      console.log("reload OK");
    })
  })

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Layout />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
