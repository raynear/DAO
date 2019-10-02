import React, { useState } from 'react';
import './App.css';

import { Layout, Menu, Icon } from 'antd';

const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapse, setCollapse] = useState(false);
  let folding = collapse ? 80 : 200;

  return (
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
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
          Content<br />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
