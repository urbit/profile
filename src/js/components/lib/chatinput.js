import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import { Message } from '/components/lib/message';
import { prettyShip, getMessageContent, isUrl, uuid, isDMStation, dateToDa } from '/lib/util';
import { sealDict } from '/components/lib/seal-dict';
import { Elapsed } from '/components/lib/elapsed';
import { PAGE_STATUS_PROCESSING, PAGE_STATUS_READY, REPORT_PAGE_STATUS } from '/lib/constants';
import Mousetrap from 'mousetrap';
import classnames from 'classnames';


export class ChatInput extends Component {

  /*
    Props:
      - station
      - api
      - store
      - circle
      - placeholder
      - setPendingMessage
      - scrollbarRef
  */

  constructor(props) {
    super(props);

    this.state = {
      message: ""
    };

    this.textareaRef = React.createRef();

    this.messageSubmit = this.messageSubmit.bind(this);
    this.messageChange = this.messageChange.bind(this);
  }

  componentDidMount() {
    this.bindShortcuts();
  }

  bindShortcuts() {
    Mousetrap(this.textareaRef.current).bind('enter', e => {
      e.preventDefault();
      e.stopPropagation();

      this.messageSubmit(e);
    });
  }

  messageChange(event) {
    this.setState({message: event.target.value});
  }

  messageSubmit() {
    let aud, sep;
    let wen = Date.now();
    let uid = uuid();
    let aut = this.props.api.authTokens.ship;

    let config = this.props.store.configs[this.state.station];

    if (isDMStation(this.props.station)) {
      aud = this.props.station
        .split("/")[1]
        .split(".")
        .map((mem) => `~${mem}/${this.props.circle}`);

    } else {
      aud = [this.props.station];
    }

    if (isUrl(this.state.message)) {
      sep = {
        url: this.state.message
      }
    } else {
      sep = {
        lin: {
          msg: this.state.message,
          pat: false
        }
      }
    }

    let message = {
      uid,
      aut,
      wen,
      aud,
      sep,
    };

    this.props.api.hall({
      convey: [message]
    });

    this.props.setPendingMessage(message);

    console.log('ending message submit');

    this.setState({
      message: ""
    });

    // TODO:  Push to end of event queue to let pendingMessages render before scrolling
    //        There's probably a better way to do this
    setTimeout(() => {
      if (this.props.scrollbarRef.current) this.props.scrollbarRef.current.scrollToBottom();
    })
  }

  render() {
    return (
      <form>
        <textarea className="chat-input-field"
          resize="none"
          ref={this.textareaRef}
          placeholder={this.props.placeholder}
          value={this.state.message}
          onChange={this.messageChange} />
      </form>
    )
  }
}
