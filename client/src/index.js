import React from 'react';
import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.querySelector('.root'));
const widget = document.querySelector('.root');
root.render(
  <React.StrictMode>
    {/* <BrowserRouter basename='/whatsapp-widget'> */}
    <App
      show={widget.dataset.status}
      chat={widget.dataset.chat}
      clientid={widget.dataset.clientid}
    />
    {/* </BrowserRouter> */}
  </React.StrictMode>
);
