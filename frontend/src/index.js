const React = require('react');
const ReactDOM = require('react-dom/client');
const { BrowserRouter } = require('react-router-dom');
const App = require('./App').default;
require('./index.css');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(App, null)
    )
  )
);