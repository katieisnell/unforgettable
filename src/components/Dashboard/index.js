import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

import { 
  FirebaseContext, 
  withFirebase 
} from '../Firebase';

import { 
  AuthUserContext, 
  withAuthorisation 
} from '../Session';

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
    this.fileInput = React.createRef();
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

  onCreateMoment = (event, authUser) => {
    event.preventDefault();

    // Create a storage reference from our storage service
    var storageRef = this.props.firebase.storage.ref();

    var file = this.fileInput.current.files[0];

    var metadata = {
      contentType: 'image/jpeg'
    };

    var uploadTask = storageRef.child('moments/' + file.name).put(file, metadata);

    uploadTask.on('state_changed',
      function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');

        switch (snapshot.state) {
          case 'paused': // or 'paused'
            console.log('Upload is paused');
            break;
          case 'running': // or 'running'
            console.log('Upload is running');
            break;
          default:
            break;
        }
      }, function(error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            console.log('Unauthorised user');
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            console.log('Unknown error occured 😢');
            break;
          default:
            break;
        }
      }, function() {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
          // TODO: Add code to connect images to user database

        });
      });
  };

  render() {
    const { moments, loading } = this.state;
    console.log(moments);
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <div>Loading ...</div>}

            {moments ? (
              <MomentList moments={moments} />
            ) : (
              <div>You have no moments <span role='img' aria-label='shrug'>🤷‍♂️</span></div>
            )}
            
            <form onSubmit={event => this.onCreateMoment(event, authUser)}>
              <input type='file' ref={this.fileInput} />
              <button type='submit'>Upload</button>
            </form>

          </div>
        )}
      </AuthUserContext.Consumer>
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
