import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

class Landing extends React.Component {
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
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;