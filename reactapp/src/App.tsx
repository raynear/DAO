import React from "react";
import { BrowserRouter } from "react-router-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import Cookies from "js-cookie";

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

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <LayoutContainer />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
