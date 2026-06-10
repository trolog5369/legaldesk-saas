import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/index';
import App from './App';
import AuthLoader from './components/shared/AuthLoader';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthLoader>
          <App />
        </AuthLoader>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
