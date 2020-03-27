import React from 'react';
import { Button, Dimmer, Dropdown, Form, Label, Loader } from 'semantic-ui-react';
import _ from 'lodash';

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

import * as MOMENTS from '../../constants/moments';
const USER_UPLOADED = 'USER_UPLOADED';

class UserUploadedDashboard extends React.Component {
  render() {
    return (
      <div className='App'>
        <div className='App-content'>
          <div className='App-header'>
            <Tape text={'User Moments'}/>
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
      currentMoment: MOMENTS.ALL_IMAGES,
      loading: false,
      images: null,
      mostPostedLabelsImages: null,
      multipleTaggedPeopleImages: null,
      happyPeopleImages: null,
      labelCloud: null,
      topLabels: null,
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
      const labelCloud = snapshot.exportVal()[userId].label_cloud;

      if (labelCloud) {
        const data = labelCloud['_data'];

        // Construct data to be in the form that the <LabelCloud> component can accept
        let labelCloudData = [];
        Object.values(data).forEach(label => {
          labelCloudData.push({ text: label[0], value: label[1] });
        })

        // Filter keys with same max value
        const maxValue = _.max(Object.values(data))[1];
        const keysWithMaxValue = _.filter(Object.keys(data), o => {
          return data[o][1] === maxValue
        })
        const topLabelsResult = keysWithMaxValue.map(d => { 
          return { 
            name: data[d][0], value: data[d][1] 
          }
        });

        this.setState({
          labelCloud: labelCloudData,
          topLabels: topLabelsResult
        });
      }
    });

    this.props.firebase.mostPostedLabelsImages().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
      const imageObject = snapshot.val();

      if (imageObject) {
        // Store filter uids
        const imageList = Object.keys(imageObject).map(key => (
          imageObject[key].uid
        ));

        this.setState({ 
          mostPostedLabelsImages: imageList
        });
      }
      this.setState({ 
        loading: false 
      });
    });

    this.props.firebase.multipleTaggedPeopleImages().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
      const imageObject = snapshot.val();

      if (imageObject) {
        // Store filter uids
        const imageList = Object.keys(imageObject).map(key => (
          imageObject[key].uid
        ));

        this.setState({ 
          multipleTaggedPeopleImages: imageList
        });
      }
      this.setState({ 
        loading: false 
      });
    });

    this.props.firebase.happyPeopleImages().orderByChild('user_id').equalTo(userId).on('value', snapshot => {
      const imageObject = snapshot.val();

      if (imageObject) {
        // Store filter uids
        const imageList = Object.keys(imageObject).map(key => (
          imageObject[key].uid
        ));

        this.setState({ 
          happyPeopleImages: imageList
        });
      }
      this.setState({ 
        loading: false 
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.userUploadedImages().off();
    this.props.firebase.mostPostedLabelsImages().off();
    this.props.firebase.multipleTaggedPeopleImages().off();
    this.props.firebase.happyPeopleImages().off();
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

      storageRef.child(`userUploadedImages/${authUser.uid}/${file.name}`).put(file, metadata)
      .then((snapshot) => {   
        snapshot.ref.getDownloadURL()
        .then(function(downloadURL) {
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

  calculateUniqueCount(images) {
    return new Set(Object.values(images)).size;
  }

  render() {
    const { 
      currentMoment,
      images,
      labelCloud,
      topLabels,
      loading,
      mostPostedLabelsImages,
      multipleTaggedPeopleImages,
      happyPeopleImages
    } = this.state;

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

          {images &&
          <div className='moments'>
            <div className='moments-item' tabIndex='0'>
              <Dropdown
              text='Filter moments'
              floating
              labeled
              button
              icon='filter'
              className='icon'
              fluid
            >
              <Dropdown.Menu>
                <Dropdown.Header icon='tags' content='Filter by tag' />
                <Dropdown.Divider />
                {images && (
                  <Dropdown.Item 
                    description={this.calculateUniqueCount(images)}
                    text='All images'
                    value={MOMENTS.ALL_IMAGES}
                    onClick={(event, data) => this.setState({ currentMoment: data.value })}
                  />
                )}
                {mostPostedLabelsImages && (
                  <Dropdown.Item 
                    description={this.calculateUniqueCount(mostPostedLabelsImages)}
                    text='Most posted tag'
                    value={MOMENTS.MOST_POSTED_LABELS_IMAGES}
                    onClick={(event, data) => this.setState({ currentMoment: data.value })}
                  />
                )}
                {multipleTaggedPeopleImages && (
                  <Dropdown.Item 
                    description={this.calculateUniqueCount(multipleTaggedPeopleImages)}
                    text='Multiple tagged people'
                    value={MOMENTS.MULTIPLE_TAGGED_PEOPLE_IMAGES}
                    onClick={(event, data) => this.setState({ currentMoment: data.value })}
                  />
                )}
                {happyPeopleImages && (
                  <Dropdown.Item 
                    description={this.calculateUniqueCount(happyPeopleImages)}
                    text='Happy people'
                    value={MOMENTS.HAPPY_PEOPLE_IMAGES}
                    onClick={(event, data) => this.setState({ currentMoment: data.value })}
                  />
                )}
              </Dropdown.Menu>
            </Dropdown>
            </div>
          </div>}

          {currentMoment === MOMENTS.ALL_IMAGES && (
            images != null ? (
            <div>
              <h2>All images</h2>
              <ImageList images={images} />
            </div>
          ) : (
            <p>You have no images <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
          ))}
          {currentMoment === MOMENTS.MOST_POSTED_LABELS_IMAGES && (
            mostPostedLabelsImages != null ? (
            <div>
              <h2>Images with the most posted labels</h2>
              {topLabels && (
                <Label.Group tag size='large'>
                {topLabels.map(label => (
                  <Label key={label.name}>
                    {label.name}
                    <Label.Detail>{label.value}</Label.Detail>
                  </Label>
                ))}
                </Label.Group>
              )}
              <ImageList images={images} filter={mostPostedLabelsImages} />
            </div>
          ) : (
            <p>You have no moments for 'most posted tags' <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
          ))}
          {currentMoment === MOMENTS.MULTIPLE_TAGGED_PEOPLE_IMAGES && (
            multipleTaggedPeopleImages != null ? (
            <div>
              <h2>Images with the multiple people</h2>
              <ImageList images={images} filter={multipleTaggedPeopleImages} />
            </div>
          ) : (
            <p>You have no moments for 'multiple tagged people' <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
          ))}
          {currentMoment === MOMENTS.HAPPY_PEOPLE_IMAGES && (
            happyPeopleImages != null ? (
            <div>
              <h2>Images with happy people</h2>
              <ImageList images={images} filter={happyPeopleImages} />
            </div>
          ) : (
            <p>You have no moments for 'happy people' <span role='img' aria-label='shrug'>🤷‍♂️</span></p>
          ))}

          <div className='file-upload'>
            <Form onSubmit={event => this.uploadImages(event, authUser)} size='huge'>
              <p>Select some photos below to upload...</p>
              <Form.Group widths='equal'>
                <input type='file' ref={this.fileInput} accept='image/*' multiple />
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

const ImageList = ({ images, filter }) => (
  <div className='moments'>
  {filter ? (
    images.map(image => (
      Object.values(filter).includes(image.uid) && (
        <ImageItem key={image.uid} image={image} />
      )
    ))
  ) : (
    images.map(image => (
      <ImageItem key={image.uid} image={image} />
    ))
  )}
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
          {image.labels != null && image.labels.error != null && (
            <Label>{image.labels.error.description}</Label>
          )}
          {image.labels != null && image.labels.error == null && (
            image.labels.map((element, index) => 
              <Label key={index}>{element.description}</Label>)
          )}
        </Label.Group>

        {image.faces && (
          <Label.Group size='large'>
            {image.faces.map((element, index) => 
            <Label key={index}>
              {(element.joyLikelihood === 'VERY_LIKELY' || element.joyLikelihood === 'LIKELY') && (
                <span role='img' aria-label='joy'>😄</span>
              )}
              {(element.surpriseLikelihood === 'VERY_LIKELY' || element.surpriseLikelihood === 'LIKELY') && (
                <span role='img' aria-label='surprise'>😲</span>
              )}
              {(element.sorrowLikelihood === 'VERY_LIKELY' || element.sorrowLikelihood === 'LIKELY') && (
                <span role='img' aria-label='sorrow'>😢</span>
              )}
              {(element.angerLikelihood === 'VERY_LIKELY' || element.angerLikelihood === 'LIKELY') && (
                <span role='img' aria-label='anger'>😠</span>
              )}
              {(element.joyLikelihood !== 'VERY_LIKELY' && element.joyLikelihood !== 'LIKELY') &&
               (element.surpriseLikelihood !== 'VERY_LIKELY' && element.surpriseLikelihood !== 'LIKELY') &&
               (element.sorrowLikelihood !== 'VERY_LIKELY' && element.sorrowLikelihood !== 'LIKELY') &&
               (element.angerLikelihood !== 'VERY_LIKELY' && element.angerLikelihood !== 'LIKELY') && (
                <span role='img' aria-label='blank'>😶</span>
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
