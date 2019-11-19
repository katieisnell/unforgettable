import React from 'react';
import './App.css';

import logo from './logo.png';
import desktopImage from './paper-desktop.jpg';

class App extends React.Component {
  render() {
    const imageUrl = desktopImage;
    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <h1>#unforgettable</h1>
            <p>Login with <a href='http://127.0.0.1:8080/'>Instagram</a></p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
