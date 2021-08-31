import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

import store from './store';
import App from './App';

import './index.scss';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <DndProvider options={HTML5toTouch}>
        <App />
      </DndProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
