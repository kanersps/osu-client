import React from 'react';
import { RecoilRoot } from 'recoil';
import './App.css';
import Client from './components/client';

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <Client />
      </RecoilRoot>
    </div>
  );
}

export default App;
