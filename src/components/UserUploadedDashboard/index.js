import React from 'react';
import { Button, Dimmer, Form, Label, Loader } from 'semantic-ui-react'

import '../App/App.css';
import './UserUploadedDashboard.css';

import LabelCloud from '../LabelCloud';
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
      <div className='App'>
        <div className='App-content'>
          <div className='App-header'>
            <Tape text={'User images'}/>
          </div>
          <div className='Moments-content'>
            <Images />
          </div>
        </div>
      </div>
    );
  }
}

class ImagesBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: 'Unknown user',
      loading: false,
      images: null,
      labelCloud: null,
      showPopup: false
    };
    this.fileInput = React.createRef();
    this.uploadImages = this.uploadImages.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });

    var userId = this.props.firebase.auth.currentUser.uid;
    this.setState({ currentUser: userId });

    this.props.firebase.userUploadedImages().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
      const imageObject = snapshot.val();

      if (imageObject) {
        // Convert images list from snapshot
        const imageList = Object.keys(imageObject).map(key => ({
          ...imageObject[key],
          uid: key
        }));

        this.setState({ 
          images: imageList
        });
      }
      this.setState({ 
        loading: false 
      });
    });

    this.props.firebase.users().on('value', snapshot => {
      const labelCloud = snapshot.val()[userId].label_cloud;

      if (labelCloud) {
        let data = [];
        Object.values(labelCloud['_data']).forEach(label => {
          data.push({ text: label[0], value: label[1]})
        })

        this.setState({
          labelCloud: data
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.userUploadedImages().off();
    this.props.firebase.users().off();
  }

  uploadImages = (event, authUser) => {
    event.preventDefault();

    // Create a storage reference from our storage service
    const storageRef = this.props.firebase.storage.ref();
    const imagesRef = this.props.firebase.userUploadedImages();

    const noOfFiles = this.fileInput.current.files.length;
    
    for (var i = 0; i < noOfFiles; i++) {
      var file = this.fileInput.current.files[i];

      var metadata = {
        contentType: 'image/jpeg'
      };
      
      const currentTime = (new Date()).getTime();

      storageRef
          .child(`userUploadedImages/${authUser.uid}/${file.name}`)
          .put(file, metadata).then((snapshot) => {   
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              // console.log('Download url', downloadURL)

              // Connects images to user in database
              imagesRef.push({
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
    const { images, loading, labelCloud } = this.state;
    
    return (
      <AuthUserContext.Consumer>
        {authUser => (
	      <div className='container'>
          {loading && (
            <Dimmer active>
              <Loader size='huge'>Loading</Loader>
            </Dimmer>
          )}

          {labelCloud && (              
            <LabelCloud data={labelCloud}/>
          )}

          {images != null ? (
            <div>
              <ImageList images={this.state.images} />
            </div>
          ) : (
            <p>You have no images <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
          )}

          <div className='file-upload'>
            <Form onSubmit={event => this.uploadImages(event, authUser)} size='huge'>
              <p>Select some photos below to upload...</p>
              <Form.Group widths='equal'>
                <input type='file' ref={this.fileInput} multiple />
                <Button
                  content='Upload'
                  labelPosition='left'
                  icon='upload'
                  type='submit'
                />   
              </Form.Group>
            </Form>
          </div>

        </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const ImageList = ({ images }) => (
  <div className='moments'>
  {images.map(image => (
      <ImageItem key={image.uid} image={image} />
    ))}
  </div>
);

const ImageItem = ({ image }) => (
  <div className='moments-item' tabIndex='0'>
    <img src={image.media_url} alt={image.uid} className='moments-image'/>

    {image.labels == null && (
      <Dimmer active size='massive'>
        <Loader>Labels loading</Loader>
      </Dimmer>
    )}

    <div className='moments-item-info'>
      <div>
        <Label.Group tag size='large'>
          {image.labels != null && (
            image.labels[0].labelAnnotations.map((element, index) => 
            <Label key={index}>{element.description}</Label>)
          )}
        </Label.Group>

        {image.faces && (
          <Label.Group size='large'>
            {image.faces.faceAnnotations.map((element, index) => 
            <Label key={index}>
              {(element.joyLikelihood === ('VERY_LIKELY' || 'LIKELY')) && (
                <span role='img' aria-label='joy'>😄</span>
              )}
              {(element.surpriseLikelihood === ('VERY_LIKELY' || 'LIKELY')) && (
                <span role='img' aria-label='surprise'>😲</span>
              )}
              {(element.sorrowLikelihood === ('VERY_LIKELY' || 'LIKELY')) && (
                <span role='img' aria-label='sorrow'>😢</span>
              )}
              {(element.angerLikelihood === ('VERY_LIKELY' || 'LIKELY')) && (
                <span role='img' aria-label='anger'>😠</span>
              )}
            </Label>)}
          </Label.Group>
        )}
        
        <Label.Group size='large'>
          <Label>Uploaded on {new Date(image.timestamp).toLocaleDateString()}</Label>
        </Label.Group>
      </div>
    </div>
  </div>
);

const Images = withFirebase(ImagesBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(UserUploadedDashboard);
