import React from 'react';

import ApolloClient from 'apollo-boost';
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";

import Cookies from 'js-cookie';

import Layout from './Layout';

const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql/',
  // tell apollo to include credentials for csrf token protection
  credentials: 'include',
  // async operation with fetch to get csrf token
  request: async (operation) => {
    const csrftoken = await fetch('http://localhost:8000/csrf/')
      .then(response => response.json())
      .then(data => data.csrfToken);
    // set the cookie 'csrftoken'
    Cookies.set('csrftoken', csrftoken);
    operation.setContext({
      // set the 'X-CSRFToken' header to the csrftoken
      headers: {
        'X-CSRFToken': csrftoken,
      },
    });
  },
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Layout />
    </ApolloProvider>
  );
}

export default App;
