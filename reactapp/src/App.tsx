import React from "react";
import { BrowserRouter } from "react-router-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import Cookies from "js-cookie";

import { VIEWER } from "./GQL";
import { selectedIconService, jsonRpcSendTx } from "./IconConnect";
import LayoutContainer from "./LayoutContainer";
import { graphqlURL, csrfURL } from "./Config";

const client = new ApolloClient({
  // TODO : change on test serve
  uri: graphqlURL,
  // tell apollo to include credentials for csrf token protection
  credentials: "include",
  // async operation with fetch to get csrf token
  request: async operation => {
    let csrf = Cookies.get("csrftoken");
    if (csrf === undefined) {
      // TODO : change on test serve
      let csrftoken = await fetch(csrfURL)
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
      client.writeData({ data: { connected_address: payload } });
      // console.log(client);
      sendVerify(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  function sendVerify(address: string) {
    client.query({ query: VIEWER }).then(async (result) => {
      // console.log("reload OK");
      const lastBlock = await selectedIconService.getBlock('latest').execute();
      const params = { "_block_hash": lastBlock.blockHash, "_id": result.data.viewer.username };

      jsonRpcSendTx(address, "verify", params);
    })
  }

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <LayoutContainer />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
