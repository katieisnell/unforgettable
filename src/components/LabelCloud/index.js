import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react'

import { TagCloud } from 'react-tagcloud';

import './LabelCloud.css'; 

class LabelCloud extends Component {
  state = { 
    modalOpen: false,
    currentLabel: ''
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <>
        <TagCloud
          colorOptions={colorOptions}
          minSize={12}
          maxSize={35}
          style={labelCloudStyle}
          tags={this.props.data}
          onClick={label => {
            this.setState({
              modalOpen: true,
              currentLabel: label
            })
          }}
        />
        <Modal
          open={this.state.modalOpen}
          onClose={this.handleClose}
          size='small'
          dimmer={'blurring'}
          closeIcon
        >
          <Modal.Header>Details about the tag "{this.state.currentLabel.value}"</Modal.Header>
            <Modal.Content>
              <p>
                Number of occurrences in your moments - {this.state.currentLabel.count}
              </p>
            </Modal.Content>
        </Modal>
      </>
    );
  }
}

const colorOptions = {
  luminosity: 'dark',
  hue: 'random',
}

const labelCloudStyle = {
  maxWidth: 650, 
  margin: '0 auto',
  paddingBottom: 10
};

export default LabelCloud;