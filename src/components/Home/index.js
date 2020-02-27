import React from 'react';

import '../App/App.css';
import './Home.css';
import logo from '../../assets/logo.png'

class Landing extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='limit'>
            <h2>Project title: “#unforgettable: What are the social factors associated with memorable photographs?”</h2>
              <p>
                In this project I have explored the use of tags, and emotion-recognition to distinguish key memorable images from social media feeds. 
                I have determined what makes an unforgettable image different from other images, and developed an end-to-end web application solution which shows these tags in a user-friendly way.
              </p>
              <p>
                The project has a focus on recognising key objects in images and labelling them, and then quantifying their unforgettableness by analysing the amount of searches on Google with regards to each label.
              </p>
              <p>
                Take some time to explore the application! Create an account, and then try to upload some of your memories. You might be surprised what is unforgettable for you <span role='img' aria-label='thinking'>🤔</span>...
              </p>
           </div>
        </div>
      </div>
    );
  }
}

export default Landing;