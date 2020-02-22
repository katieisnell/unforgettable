import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'

import Tape from '../Tape';

class Landing extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <Tape text={'#unforgettable'}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;