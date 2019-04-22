import React, { Component } from 'react';
import { sealDict } from '/components/lib/seal-dict';

export class Sigil extends Component {
  render() {
    let prefix = this.props.prefix ? JSON.parse(this.props.prefix) : false;

    return (
      sealDict.getSeal(this.props.ship.substr(1), this.props.size, prefix)
    )
  }
}
