import React, { Component } from 'react';
import ReactWordcloud from 'react-wordcloud';
import { Button, Image, Modal } from 'semantic-ui-react'

import './LabelCloud.css'; 

import { 
  withFirebase 
} from '../Firebase';

class LabelCloudBase extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      modalOpen: false,
      currentLabel: '',
      databaseLabels: null,
      searchResponse: null
    };
    this.handleGenerateData = this.handleGenerateData.bind(this);
  }

  componentDidMount() {
    this.props.firebase.labels().on('value', snapshot => {
      const labelObject = snapshot.val();

      if (labelObject) {
        this.setState({
          databaseLabels: labelObject
        })
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.labels().off();
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  handleGenerateData = (e) => {
    e.preventDefault();
    this.setState({ loading: true });

    const { databaseLabels, currentLabel } = this.state;

    const labelValue = currentLabel.text;

    if (databaseLabels[labelValue]) {
      console.log('Label search results already found in database', databaseLabels[labelValue]);
      this.setState({ loading: false });
      return
    }

    const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    const url = `https://us-central1-unforgettable-30030.cloudfunctions.net/getGoogleSearchResults?label=${encodeURIComponent(labelValue)}`

    fetch(proxyurl + url, {
      method: 'POST'
    })
    .then(contents => {
      this.setState({ 
        searchResponse: contents,
        loading: false 
      });
      console.log('Data fetched from Google Search results API', contents);
    })
    .catch(error => {
      console.error('Oops!', error)
      this.setState({ loading: false });
    });
  }

  render() {
    const { currentLabel, databaseLabels, loading } = this.state;

    const labelValue = currentLabel.text;
    const labelCount = currentLabel.value;

    let labelSearchResults;
    if (labelValue && databaseLabels && databaseLabels[labelValue]) {
      labelSearchResults = databaseLabels[labelValue].searchResults;
    }

    return (
      <>
        <div style={{ margin: '0 auto', maxWidth: '650px' }}>
          <ReactWordcloud
              options={labelCloudOptions}
              words={this.props.data}
              callbacks={{
                onWordClick: (label) => {
                  this.setState({
                    modalOpen: true,
                    currentLabel: label
                  })
                }
              }}
            />
        </div>
        <Modal
          open={this.state.modalOpen}
          onClose={this.handleClose}
          size='small'
          dimmer={'blurring'}
          closeIcon
        >
          <Modal.Header><h2>Details about the tag '{labelValue}'</h2></Modal.Header>
            <Modal.Content>
              <p>
                <b>Number of occurrences in your moments</b> {labelCount}
              </p>
              {labelSearchResults && (
                <>
                  <p>
                    <b>Number of search results for the tag</b> {labelSearchResults.search_information.total_results}
                  </p>
                  <p>
                    <b>Related searches on the web:</b>
                  </p>
                  <ul>
                    {labelSearchResults.related_searches.map((searchTerm) => 
                      <li key={searchTerm.query}><a href={searchTerm.link} rel='noopener noreferrer' target='_blank'>{searchTerm.query}</a></li>)}
                  </ul>
                  {labelSearchResults.knowledge_graph && labelSearchResults.knowledge_graph.images && (
                    <>
                    <p>
                      <b>Related images on the web:</b>
                    </p>
                    <Image.Group size='small'>
                      {labelSearchResults.knowledge_graph.images.map((image) => 
                        <Image rounded key={image} src={image}/>
                      )}
                    </Image.Group>
                    </>
                  )}
                  {labelSearchResults.top_stories && (
                    <>
                    <p>
                      <b>Related stories on the web:</b>
                    </p>
                    <ul>
                      {labelSearchResults.top_stories.map((story) => 
                        <li key={story.link}><a key={story.link} href={story.link} rel='noopener noreferrer' target='_blank'>{story.title}</a> (Source: {story.source})</li>
                      )}
                    </ul>
                    </>
                  )}
                </>
              )}
              {loading ? (
                <Button loading primary size='huge'>Generate search result data</Button>
              ) : (!labelSearchResults &&
                <Button primary size='huge' onClick={(e) => this.handleGenerateData(e)}>Generate search result data</Button>
              )}
            </Modal.Content>
        </Modal>
      </>
    );
  }
}

const labelCloudOptions = {
  deterministic: true,
  fontFamily: 'Walter Turncoat',
  fontSizes: [10, 36],
  rotations: 1,
  rotationAngles: [0, 90],
  transitionDuration: 2000
};

const LabelCloud = withFirebase(LabelCloudBase);

export default LabelCloud;