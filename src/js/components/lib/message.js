import React, { Component } from 'react';
import { isDMStation, getMessageContent } from '/lib/util';
import { Button } from '/components/lib/button';
import { IconCheck } from '/components/lib/icons/icon-check';
import { IconCross } from '/components/lib/icons/icon-cross';
import { getStationDetails } from '/services';
import { PAGE_STATUS_TRANSITIONING, REPORT_PAGE_STATUS } from '/lib/constants';

export class Message extends Component {
  constructor(props) {
    super(props);

    this.respondInvite = this.respondInvite.bind(this);
  }

  buildPostTitle(messageDetails) {
    if (messageDetails.postUrl) {
      return (
        <a className="pr-12 text-600 underline"
          href={messageDetails.postUrl}>
          {messageDetails.postTitle}
        </a>
      )
    } else {
      return null;
    }
  }

  subStation(station) {
    let stationDetails = getStationDetails(station);

    this.props.api.hall({
      source: {
        nom: 'inbox',
        sub: true,
        srs: [station]
      }
    });

    this.props.storeReports([{
      type: REPORT_PAGE_STATUS,
      data: PAGE_STATUS_TRANSITIONING
    }]);

    this.props.pushCallback("circle.config.dif.source", (rep) => {
      console.log(stationDetails.stationUrl);
      window.location.href = stationDetails.stationUrl;
    });
  }

  respondInvite(actionData) {
    if (actionData.response === true) {
      this.subStation(actionData.msgDetails.content.sta);
    }

    this.updateInvite(actionData.msgDetails, actionData.response);
  }

  updateInvite(msgDetails, resp) {
    let tagstring = resp ? "Accept" : "Decline";

    let msg = {
      aud: [`~${this.props.api.authTokens.ship}/i`],
      ses: [{
        ire: {
          top: msgDetails.msg.uid,
          sep: {
            lin: {
              msg: `${tagstring} ${msgDetails.content.sta}`,
              pat: false
            }
          }
        }
      }]
    }

    api.hall({
      phrase: msg
    });
  }

  render() {
    if (this.props.details.type === "text") {
      return this.buildPostTitle(this.props.details);
    } else if (this.props.details.type === "inv") {
      if (isDMStation(this.props.details.content.sta)) {
        return null;
      }

      return (
        <div className="row">
          <div className="flex-offset-2 flex-col-4">
            <a className="text-mono text-host-breadcrumb" href={`/~profile/~${this.props.details.msg.aut}`}>~{this.props.details.msg.aut}</a>
            <span className="text-host-breadcrumb ml-2 mr-2">/</span>
            <span className="text-mono text-700">{this.props.details.content.nom}</span>
          </div>
          <div className="flex-col-x">
            <Button
              classes="btn btn-sm btn-icon btn-primary mr-1"
              action={this.respondInvite}
              actionData={{msgDetails: this.props.details, response: true}}
              pushCallback={this.props.pushCallback}
              responseKey="circle.config.dif.full"
              content={IconCheck}
             />

             <Button
               classes="btn btn-sm btn-icon"
               action={this.respondInvite}
               actionData={{msgDetails: this.props.details, response: false}}
               pushCallback={this.props.pushCallback}
               responseKey="circle.config.dif.full"
               content={IconCross}
              />
          </div>
        </div>
      )
    } else if (this.props.details.type === "url") {
        if (/(jpg|img|png|gif|tiff|jpeg|JPG|IMG|PNG|TIFF)$/.exec(this.props.details.content)) {
          return (
            <img src={this.props.details.content} style={{width:"30%"}}></img>
          )
        }
        else {
          return (
            <a href={this.props.details.content} target="_blank">{this.props.details.content}</a>
          )
        }
    } else if (this.props.details.type === "exp") {
      return (
        <div className="text-body">
          <div className="text-mono">{this.props.details.content}</div>
          <pre className="text-mono mt-0">{this.props.details.res}</pre>
        </div>
      )
    } else if (['new item', 'edited item'].includes(this.props.details.type)) {
      return <span className="text-body" dangerouslySetInnerHTML={{__html: this.props.details.snip}}></span>
    } else if (this.props.details.type === "lin") {
      return (
        <span className="text-body">
          {this.props.replyTo &&
            <span className="text-gray">[replying to ~{this.props.replyTo}] </span>
          }
          <span>{this.props.details.content}</span>
        </span>
      )
    }

    return <span className="text-mono">{'<unknown message type>'}</span>;
  }
}
