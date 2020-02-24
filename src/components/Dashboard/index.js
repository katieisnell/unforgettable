import React from 'react';

import '../App/App.css';
import './Dashboard.css';

import Tape from '../Tape';

import { 
  withFirebase 
} from '../Firebase';

import { 
  AuthUserContext, 
  withAuthorisation 
} from '../Session';

const INSTA_UPLOADED = 'INSTA_UPLOADED';

class Dashboard extends React.Component {
  render() {
    return (
      <div className="App">
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
      currentUser: 'Unknown user',
      loading: false,
      moments: null,
      visionResponse: null,
      accessToken: null,
      instaMedia: null
    };
    this.fileInput = React.createRef();
    this.onCreateMoment = this.onCreateMoment.bind(this);
    this.onCreateLabels = this.onCreateLabels.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });

    var userId = this.props.firebase.auth.currentUser.uid;
    this.setState({ currentUser: userId });

    this.props.firebase.users().on('value', snapshot => {
      this.setState({
        accessToken: snapshot.val()[userId].access_token
      });
    });

    this.props.firebase.moments().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
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
        fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${encodeURIComponent(this.state.accessToken)}`, {
          method: 'GET',
        })
        .then(response => {
          if (response.ok) {
                  return response;
          } else {
              let errorMessage = `${response.statusText}`,
              error = new Error(errorMessage);
              throw(error);
          }
        })
        .then(response => response.json())
        .then(json => {
          this.setState({ 
            instaMedia: json.data,
            loading: false 
          });
          console.log('Data fetched from Instagram successfully');
          this.onCreateMoment(userId, json.data);
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.moments().off();
  }

  onCreateMoment = (userId, instaMedia) => {
    // Create a storage reference from our storage service
    const momentsRef = this.props.firebase.moments();

    for (var i = 0; i < instaMedia.length; i++) {
      const file = instaMedia[i];

      // Connects images to user in database
      momentsRef.push({
        media_id: file.id,
        user_id: userId,
        caption: file.caption,
        media_type: file.media_type,
        media_url: file.media_url,
        permalink: file.permalink,
        timestamp: file.timestamp,
        content_origin: INSTA_UPLOADED
      });
    }
  }

  onCreateLabels(moments) {
    for (var i = 0; i < moments.length; i++) {
      var photo_url = moments[i].media_url;
      console.log('Vision API is currently analysing', i, photo_url);

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
    const { moments, loading, visionResponse } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
	      <div className="container">

          <button onClick={(e) => this.onCreateLabels(moments, e)}>Generate labels</button>
          {visionResponse != null && (
            <p>Vision response <br/>{this.state.visionResponse}</p>
          )}
          
          {loading && <div>Loading ...</div>}

          {moments != null ? (
            <div>
              <p>You have moments!</p>
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
      <MomentItem key={moment.media_id} moment={moment} />
    ))}
  </div>
);

const MomentItem = ({ moment }) => (
  <div className="moments-item" tabIndex="0">
    <img src={moment.media_url} alt={moment.id} className="moments-image"/>

    <div className="moments-item-info">
      <ul>
        <li className="moments-item-captions">{moment.caption}</li>
        <li className="moments-item-timestamps">Uploaded on {new Date(moment.timestamp).toLocaleDateString()}</li>
      </ul>
    </div>
  </div>
);

const Moments = withFirebase(MomentsBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(Dashboard);
