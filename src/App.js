import React from 'react';
import './App.css';

import logo from './logo.png';
import desktopImage from './corkboard-desktop.jpg';

function App() {
  const imageUrl = desktopImage;
  return (
    <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
      <div className="App-content">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>#unforgettable</h1>
      </div>
    </div>
  );
}

export default App;
