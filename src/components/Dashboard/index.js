import React from 'react';

import '../App/App.css';
import './Dashboard.css';
import desktopImage from '../../assets/paper-desktop.jpg';

import Tape from '../Tape';

import { 
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

  render() {
    const imageUrl = desktopImage;

    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <div className='App-header'>
            <Tape text={'Dashboard'}/>
          </div>
          <div className='Moments-content'>
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
      moments: null,
      visionResponse: ""
    };
    this.fileInput = React.createRef();
    this.onCreateMoment = this.onCreateMoment.bind(this);
    this.onCreateLabels = this.onCreateLabels.bind(this);
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
    const storageRef = this.props.firebase.storage.ref();
    const momentsRef = this.props.firebase.moments();

    const noOfFiles = this.fileInput.current.files.length;
    
    for (var i = 0; i < noOfFiles; i++) {
      var file = this.fileInput.current.files[i];

      var metadata = {
        contentType: 'image/jpeg'
      };

      storageRef
          .child(`moments/${file.name}`)
          .put(file, metadata).then((snapshot) => {   
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('Download url', downloadURL)

              // Connects images to user in database
              momentsRef.push({
                photo_url: downloadURL,
                uid: authUser.uid
              });
        })
      })
    }
  }

  onCreateLabels(moments) {
    const noOfPhotos = moments.length;

    for (var i = 0; i < noOfPhotos; i++) {
      var photo_url = moments[i].photo_url;
      console.log('moment photo_url currently analysing', photo_url);

      this.callVision(photo_url);
    }
  }

  callVision(photo_url) {
    var parameters = {
      'photo_url': photo_url
    };

    fetch("http://localhost:9000/vision/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    })
      .then(res => res.text())
      .then(res => this.setState({ visionResponse: res }))
      .catch(err => err);
    
  }

  render() {
    const { moments, loading } = this.state;
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <div>Loading ...</div>}

            <div>
              <form onSubmit={event => this.onCreateMoment(event, authUser)}>
                <input type='file' ref={this.fileInput} multiple/>
                <button type='submit'>Upload</button>
              </form>
            </div>

            <button onClick={(e) => this.onCreateLabels(moments, e)}>Generate labels</button>
            <p>Vision response <br/>{this.state.visionResponse}</p>

            {moments ? (
              <div>
                <MomentList moments={moments} />
              </div>
            ) : (
              <div>You have no moments <span role='img' aria-label='shrug'>🤷‍♂️</span></div>
            )}

          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const MomentList = ({ moments }) => (
  <div className='moments'>
    {moments.map(moment => (
      <MomentItem key={moment.uid} moment={moment} />
    ))}
  </div>
);

const MomentItem = ({ moment }) => (
  <div className='moments-item'>
    <img src={moment.photo_url} alt={moment.uid} className='moment-image'/>
  </div>
);

const Moments = withFirebase(MomentsBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(Dashboard);
