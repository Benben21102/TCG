import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import GameRouter from './GameRouter';

export default function App() {
  return (
    <Provider store={store}>
      <GameRouter />
    </Provider>
  );
}
