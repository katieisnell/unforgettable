import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react'

import '../App/App.css';
import './InstaUploadedDashboard.css';

import Tape from '../Tape';

import { 
  withFirebase 
} from '../Firebase';

import { 
  AuthUserContext, 
  withAuthorisation 
} from '../Session';

const INSTA_UPLOADED = 'INSTA_UPLOADED';

class InstaUploadedDashboard extends React.Component {
  render() {
    return (
      <div className='App'>
        <div className='App-content'>
          <div className='App-header'>
            <Tape text={'Instagram Media'}/>
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
      accessToken: null,
      instaMedia: null
    };
    this.onCreateMoment = this.onCreateMoment.bind(this);
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

    this.props.firebase.instaUploadedImages().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
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
      } else if (this.state.accessToken !== null && this.state.accessToken !== undefined) {
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
        })
        .catch(error => {
          console.error(error)
        });
      } else {
        this.setState({ 
          loading: false 
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.instaUploadedImages().off();
    this.props.firebase.users().off();
  }

  onCreateMoment = (userId, instaMedia) => {
    // Create a storage reference from our storage service
    const momentsRef = this.props.firebase.instaUploadedImages();

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

  render() {
    const { moments, loading } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
	      <div className='container'>     
          {loading && (
            <Dimmer active>
              <Loader size='huge'>Loading</Loader>
            </Dimmer>
          )}

          {moments != null ? (
            <div>
              <p>Here is your media from Instagram!</p>
              <MomentList moments={this.state.moments} />
            </div>
          ) : (
            <p>You have no Instagram media <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
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
      <MomentItem key={moment.media_id} moment={moment} />
    ))}
  </div>
);

const MomentItem = ({ moment }) => (
  <div className='moments-item' tabIndex='0'>
    <img src={moment.media_url} alt={moment.id} className='moments-image'/>

    <div className='moments-item-info'>
      <ul>
        <li className='moments-item-captions'>{moment.caption}</li>
        <li className='moments-item-timestamps'>Uploaded on {new Date(moment.timestamp).toLocaleDateString()}</li>
      </ul>
    </div>
  </div>
);

const Moments = withFirebase(MomentsBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(InstaUploadedDashboard);
