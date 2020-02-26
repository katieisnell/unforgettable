import React, { Component } from 'react';

import { TagCloud } from 'react-tagcloud';

import './LabelCloud.css'; 

class LabelCloud extends Component {
  render() {
    return (
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={this.props.data}
        onClick={tag => alert(`'${tag.value}' was selected!`)}
      />
    );
  }
}

export default LabelCloud;