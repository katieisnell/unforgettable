import React from 'react';

import './Tape.css';
import logo from '../../assets/tape.png'

const Tape = (props) => (
  <div className='image'>
    <img src={logo} alt={logo} width={300}/>
    <h1>{props.text}</h1>
  </div>
);

export default Tape;