import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

class NotFound extends React.Component {
  render() {
    const imageUrl = desktopImage;

    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <h1>Uh oh!</h1>
            <p>The page you are looking for doesn't exist <span role="img" aria-label="crying-face">😭</span></p>
          </div>
        </div>
      </div>
    );
  }

}

export default NotFound;
