import React, { Component } from 'react';
import classnames from 'classnames';
import { Header } from '/components/header';
import { Sigil } from '/components/lib/icons/sigil';

export class ProfilePage extends Component {
  constructor(props) {
    super(props);
  }

  /*
                ;div(urb-component "ProfileMsgBtn", urb-ship "{(trip who)}");
    * */

  render() {
    return (
      <div>
        <Header
          data={{
            author: this.props.match.params.ship
          }}
          store={this.props.store}
          storeReports={this.props.storeReports}
          api={this.props.api}
        />
        <div className="container">
          <div className="row">
            <div className="flex-col-2"></div>
            <div className="flex-col-x">
              <div className="profile-avatar">
                <Sigil size="320" ship={this.props.match.params.ship} />
              </div>
            </div>
          </div>
          <div className="row mt-9">
            <div className="flex-offset-2 flex-col-x">
              <h2 className="text-500">Meta</h2>
            </div>
          </div>
          <div className="row mt-4 align-center">
            <div className="flex-col-2"></div>
            <h3 className="text-500 flex-col-1 mt-0">Started:</h3>
            <div className="flex-col-x text-mono">~2018.4.12..6.45.12</div>
          </div>
        </div>
      </div>
    );
  }
}

