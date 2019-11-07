import React from "react";

import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter } from "react-router-dom";

import Cookies from "js-cookie";

import Layout from "./Layout";

const client = new ApolloClient({
  uri: "https://localhost:8080/graphql/",
  // tell apollo to include credentials for csrf token protection
  credentials: "include",
  // async operation with fetch to get csrf token
  request: async operation => {
    let jwt = Cookies.get("JWT");
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
        "X-CSRFToken": csrf,
        Authorization: jwt ? `Bearer ${jwt}` : ""
      }
    });
  },
  cache: new InMemoryCache(),
  clientState: {
    defaults: {
      data: { username: "", email: "", photo: "", __typename: "user" }
    },
    resolvers: {},
    typeDefs: ``
  }
});

function App() {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Layout />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
