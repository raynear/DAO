import React, { useState } from 'react';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";

//import Continents from './Continents';
import Proposals from './Proposals';
import ProposalForm from './NewProposal';

import './App.css';

import { Layout, Menu, Icon } from 'antd';

import Cookies from 'js-cookie';

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

//const client = new ApolloClient({
//  link: createHttpLink({ uri: "http://localhost:8000/graphql/" }),
//  cache: new InMemoryCache()
//});

const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapse, setCollapse] = useState(false);
  let folding = collapse ? 80 : 200;

  return (
    <ApolloProvider client={client}>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapse} style={{ overflow: 'auto', height: '100vh', position: 'fixed' }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="user" />
              <span>nav 1</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera" />
              <span>nav 2</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="upload" />
              <span>nav 3</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: folding }}>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={collapse ? 'menu-unfold' : 'menu-fold'}
              onClick={() => setCollapse(!collapse)}
            />
          </Header>
          <Content
            style={{
              margin: '24px 16px 0',
              overflow: 'initial',
              padding: 24,
              background: '#fff',
              minHeight: 280,
            }}
          >
            <Proposals />
            <ProposalForm />
          </Content>
        </Layout>
      </Layout>
    </ApolloProvider>
  );
}

export default App;
