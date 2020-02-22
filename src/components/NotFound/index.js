import React from 'react';

import '../App/App.css';

import Tape from '../Tape';

class NotFound extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-content">
          <div className='App-header'>
            <Tape text={'Uh oh!'}/>
          </div>
            <p>The page you are looking for doesn't exist <span role="img" aria-label="crying-face">😭</span></p>
        </div>
      </div>
    );
  }

}

export default NotFound;
