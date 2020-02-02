import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

import { FirebaseContext, withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';

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
                // return <div>The Dashboard is accessible to every signed in user, congrats <span role="img" aria-label="content-face">😌</span></div>;
              }}
            </FirebaseContext.Consumer>

            <Moments />
          </div>
        </div>
      </div>
    );
  }
}


class MomentsBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      moments: null
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.props.firebase.moments().on('value', snapshot => {
      const momentObject = snapshot.val();
      if (momentObject) {
        // Convert moments list from snapshot
        const momentList = Object.keys(momentObject).map(key => ({
          ...momentObject[key],
          uid: key
        }));

        this.setState({ 
          moments: momentList,
          loading: false 
        });
      } else {
        this.setState({ moments: null, loading: false });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.moments().off();
  }
  render() {
    const { moments, loading } = this.state;
    console.log(moments);
    return (
      <div>
        {loading && <div>Loading ...</div>}

        {moments ? (
          <MomentList moments={moments} />
        ) : (
          <div>You have no moments <span role="img" aria-label="shrug">🤷‍♂️</span></div>
        )}
      </div>
    );
  }
}

const MomentList = ({ moments }) => (
  <ul>
    {moments.map(moment => (
      <MomentItem key={moment.uid} moment={moment} />
    ))}
  </ul>
);

const MomentItem = ({ moment }) => (
  <li>
    <strong>{moment.userId}</strong> {moment.image}
  </li>
);

const Moments = withFirebase(MomentsBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(Dashboard);
