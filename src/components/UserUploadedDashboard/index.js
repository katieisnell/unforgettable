import React from 'react';

import '../App/App.css';
import './UserUploadedDashboard.css';

import Tape from '../Tape';

import { 
  withFirebase 
} from '../Firebase';

import { 
  AuthUserContext, 
  withAuthorisation 
} from '../Session';

const USER_UPLOADED = 'USER_UPLOADED'

class UserUploadedDashboard extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-content">
          <div className='App-header'>
            <Tape text={'Uploaded moments'}/>
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
      currentUser: 'Unknown user',
      loading: false,
      moments: null,
      labelCloud: null
    };
    this.fileInput = React.createRef();
    this.onCreateMoment = this.onCreateMoment.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });

    var userId = this.props.firebase.auth.currentUser.uid;
    this.setState({ currentUser: userId });

    this.props.firebase.userUploadedMoments().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
      const momentObject = snapshot.val();

      if (momentObject) {
        // Convert moments list from snapshot
        const momentList = Object.keys(momentObject).map(key => ({
          ...momentObject[key],
          uid: key
        }));

        this.setState({ 
          moments: momentList
        });
      }
      this.setState({ 
        loading: false 
      });
    });

    this.props.firebase.users().on('value', snapshot => {
      const labelCloud = snapshot.val()[userId].label_cloud;

      if (labelCloud) {
        this.setState({
          labelCloud: snapshot.val()[userId].label_cloud
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.userUploadedMoments().off();
    this.props.firebase.users().off();
  }

  onCreateMoment = (event, authUser) => {
    event.preventDefault();

    // Create a storage reference from our storage service
    const storageRef = this.props.firebase.storage.ref();
    const momentsRef = this.props.firebase.userUploadedMoments();

    const noOfFiles = this.fileInput.current.files.length;
    
    for (var i = 0; i < noOfFiles; i++) {
      var file = this.fileInput.current.files[i];

      var metadata = {
        contentType: 'image/jpeg'
      };
      
      const currentTime = (new Date()).getTime();

      storageRef
          .child(`userUploadedMoments/${authUser.uid}/${file.name}`)
          .put(file, metadata).then((snapshot) => {   
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              // console.log('Download url', downloadURL)

              // Connects images to user in database
              momentsRef.push({
                media_url: downloadURL,
                timestamp: currentTime,
                user_id: authUser.uid,
                content_origin: USER_UPLOADED
              });
        })
      })
    }
  }

  render() {
    const { moments, loading, labelCloud } = this.state;
    
    return (
      <AuthUserContext.Consumer>
        {authUser => (
	      <div className="container">

          <div>
            <form onSubmit={event => this.onCreateMoment(event, authUser)}>
              <input type='file' ref={this.fileInput} multiple/>
              <button type='submit'>Upload</button>
            </form>
          </div>
          
          {loading && <div>Loading ...</div>}

          {labelCloud && (
            <div>
              {Object.entries(labelCloud['_data']).map(([key, value]) => (
                <li>{value[0]}({value[1]})</li>
              ))}
            </div>
          )}

          {moments != null ? (
            <div>
              <p>Here are your uploaded moments!</p>
              <MomentList moments={this.state.moments} />
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
  <div className="moments">
  {moments.map(moment => (
      <MomentItem key={moment.uid} moment={moment} />
    ))}
  </div>
);

const MomentItem = ({ moment }) => (
  <div className="moments-item" tabIndex="0">
    <img src={moment.media_url} alt={moment.uid} className="moments-image"/>

    <div className="moments-item-info">
      <ul>
        {moment.labels != null ? (
          moment.labels[0].labelAnnotations.map((element) => <li key={element.mid} className="moments-item-captions">{element.description}</li>)
        ) : (
          <li className="moments-item-captions">Labels loading...</li>
        )}
        {moment.faces && (
          moment.faces.faceAnnotations.map((element) => 
          <li key={element} className="moments-item-captions"><span role='img' aria-label='joy'>😄</span> ({element.joyLikelihood}) <span role='img' aria-label='anger'>😠</span> ({element.angerLikelihood}) <span role='img' aria-label='sorrow'>😢</span> ({element.sorrowLikelihood}) <span role='img' aria-label='surprise'>😲</span> ({element.surpriseLikelihood})</li>)
        )}
        <li className="moments-item-timestamps">Uploaded on {new Date(moment.timestamp).toLocaleDateString()}</li>
      </ul>
    </div>
  </div>
);

const Moments = withFirebase(MomentsBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(UserUploadedDashboard);
