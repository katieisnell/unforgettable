import React from 'react';
import './App.css';

import logo from './logo.png';
import desktopImage from './paper-desktop.jpg';

class Dashboard extends React.Component {
  render() {
    const imageUrl = desktopImage;

    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <h1>Dashboard</h1>
            <p>Logged in</p>
          </div>
        </div>
      </div>
    );
  }

}

export default Dashboard;
