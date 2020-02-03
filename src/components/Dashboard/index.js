import React from 'react';

import '../App/App.css';
import './Dashboard.css';
import desktopImage from '../../assets/paper-desktop.jpg';

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
            <h1>Dashboard</h1>
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
      moments: null
    };
    this.fileInput = React.createRef();
    this.onCreateMoment = this.onCreateMoment.bind(this);
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
              uid: authUser.uid,
            });
        })
      })
    }
  }

  render() {
    const { moments, loading } = this.state;
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

            <div>
              <form onSubmit={event => this.onCreateMoment(event, authUser)}>
                <input type='file' ref={this.fileInput} multiple/>
                <button type='submit'>Upload</button>
              </form>
            </div>

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
