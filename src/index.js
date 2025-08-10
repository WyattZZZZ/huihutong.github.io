import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // 引入你的App组件
import './index.css'; // 引入全局样式

// 获取 root DOM 节点
const rootElement = document.getElementById('root');

// 使用 React 18 的新版 API 创建根组件
const root = ReactDOM.createRoot(rootElement);

// 渲染App组件到DOM
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
