import React from "react";
import { BrowserRouter } from "react-router-dom";

import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import { GET_LOCAL_ME } from "./GQL";
import { selected_icon_service, json_rpc_send_tx } from "./IconConnect";
import Cookies from "js-cookie";

import LayoutContainer from "./LayoutContainer";

const client = new ApolloClient({
  uri: "http://ec2-52-79-207-139.ap-northeast-2.compute.amazonaws.com:8080/graphql/",
  // tell apollo to include credentials for csrf token protection
  credentials: "include",
  // async operation with fetch to get csrf token
  request: async operation => {
    let csrf = Cookies.get("csrftoken");
    if (csrf === undefined) {
      let csrftoken = await fetch("http://ec2-52-79-207-139.ap-northeast-2.compute.amazonaws.com:8080/csrf/")
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
      data: { username: "", email: "", photo: "", icon_address: "", snack: { open: false, message: "", __typename: "snack" }, __typename: "user" }
    },
    resolvers: {},
    typeDefs: ``
  }
});

function App(props: any) {

  const eventHandler = async (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      // console.log("response signing");
      // console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      // console.log("response json rpc");
      // console.log(payload);
    } else if (type === "RESPONSE_ADDRESS") {
      client.writeData({ data: { icon_address: payload } });
      // console.log(client);
      sendVerify(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  function sendVerify(address: string) {
    client.query({ query: GET_LOCAL_ME }).then(async (result) => {
      // console.log("reload OK");
      let lastBlock = await selected_icon_service.getBlock('latest').execute();
      let params = { "_BlockHash": lastBlock.blockHash, "_ID": result.data.username };

      json_rpc_send_tx(address, "Verify", params);
    })
  }

  client.query({ query: gql`{ viewer{ username iconAddress }}` }).then((result: any) => {
    client.writeData({ data: { username: result.data.viewer.username, icon_address: result.data.viewer.iconAddress } });
    // client.query({ query: GET_LOCAL_ME }).then(result => {
    // console.log("reload OK");
    // })
  }).catch((error: any) => {
    // console.log("Not Logined");
  })

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <LayoutContainer />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
