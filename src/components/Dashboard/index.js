import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

import  { FirebaseContext } from '../Firebase';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      name: 'Unknown user'
    };
  }
  
  componentDidMount() {
    console.log('componentDidMount');
  }

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
            <FirebaseContext.Consumer>
              {firebase => {
                return <div>I've access to Firebase and render something.</div>;
              }}
            </FirebaseContext.Consumer>
          </div>
        </div>
      </div>
    );
  }

}

export default Dashboard;
