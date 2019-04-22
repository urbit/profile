import React, { Component } from 'react';

export class ProfileMsgBtn extends Component {
  render() {
    if (this.props.api.authTokens.ship === this.props.ship.substr(1)) return null;

    let members = [this.props.api.authTokens.ship, this.props.ship.substr(1)];
    let dmStation = `~${this.props.api.authTokens.ship}/${members.sort().join(".")}`;
    let dmLink = `/~~/landscape/stream?station=${dmStation}`;

    return (
      <a className="vanilla mt-10 btn btn-primary inline-block" href={dmLink}>Message</a>
    );
  }
}
