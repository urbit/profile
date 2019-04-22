import React, { Component } from 'react';
import { getLoadingClass } from '/lib/util';
import { PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, PAGE_STATUS_DISCONNECTED, PAGE_STATUS_TRANSITIONING } from '/lib/constants';

export class PageStatus extends Component {
  constructor(props) {
    super(props);

    this.pendingAction = this.pendingAction.bind(this);
  }

  pendingAction() {
    if (this.props.transition === PAGE_STATUS_DISCONNECTED) {
      this.reconnectPolling();
    }
  }

  render() {
    let loadingClass = getLoadingClass(this.props.transition);

    return (
      <React.Fragment>
        {this.props.transition !== PAGE_STATUS_READY &&
          <div className="header-pending-panel text-small row flex-offset-1">
            <div onClick={this.pendingAction} className={loadingClass}></div>
            {this.props.transition === PAGE_STATUS_DISCONNECTED &&
              <span>Connection to <span className="text-mono">~{this.props.usership}</span> failed</span>
            }
            {this.props.transition === PAGE_STATUS_TRANSITIONING &&
              <span>Loading page...</span>
            }
            {this.props.transition === PAGE_STATUS_PROCESSING &&
              <span>Loading new data...</span>
            }
          </div>
        }
      </React.Fragment>
    );
  }
}
