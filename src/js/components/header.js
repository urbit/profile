import React, { Component } from 'react';
import { Icon } from '/components/lib/icon';
import { getQueryParams, profileUrl, dateToDa } from '/lib/util';
import { getStationDetails } from '/services';
import { Button } from '/components/lib/button';
import { PageStatus } from '/components/lib/page-status';
import { REPORT_PAGE_STATUS, REPORT_NAVIGATE, PAGE_STATUS_TRANSITIONING, PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, PAGE_STATUS_RECONNECTING, PAGE_STATUS_DISCONNECTED, LANDSCAPE_ROOT } from '/lib/constants';
import classnames from 'classnames';
import _ from 'lodash';
import { Link } from 'react-router-dom';

export class Header extends Component {
  constructor(props) {
    super(props);

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.props.storeReports([{
      type: "menu.toggle",
      data: {open: true}
    }]);
  }

  getStationHeaderData(station) {
    let stationDetails = getStationDetails(station);

    return {
      title: {
        display: stationDetails.stationTitle,
        href: stationDetails.stationUrl
      },
      breadcrumbs: [{
        display: `~${stationDetails.host}`,
        href: stationDetails.hostProfileUrl
      }],
      station,
      stationDetails
    }
  }
  
  buildHeaderBreadcrumbs(headerData) {
    if (headerData.breadcrumbs) {
      return headerData.breadcrumbs.map(({display, href}, i) => {
        return (
          <React.Fragment>
            <a className="text-host-breadcrumb" key={display} href={href}>{display}</a>
            <span className="text-host-breadcrumb text-600 ml-2 mr-2">/</span>
          </React.Fragment>
        )
      })
    }

    return null;
  }

  buildHeaderContent(headerData) {
    let breadcrumbsElem, headerClass;

    breadcrumbsElem = this.buildHeaderBreadcrumbs(headerData);

    headerClass = classnames({
      'flex-col-x': true,
      'header-title': true,
      'text-mono': headerData.title && headerData.title.style === "mono"
    })

    return (
      <div className="container header-container">
        <div className="row">
          <div className="flex-col-2"></div>
          <div className="flex-col-x header-breadcrumbs">
            {breadcrumbsElem}
          </div>
        </div>
        <div className="row align-center header-mainrow">
          <div className="flex-col-1 flex justify-end" />
          <div className="flex-col-1 flex space-between align-center">
            <a onClick={this.toggleMenu}>
              <Icon type="icon-panini" />
            </a>
            <Icon type={headerData.icon} label={true} />
          </div>
          <h1 className={headerClass}>
            <a href={headerData.title.href}>{headerData.title.display}</a>
          </h1>
        </div>
        <PageStatus
          transition={this.props.store.views.transition}
          usership={this.props.api.authTokens.ship}
          storeReports={this.props.storeReports}
        />
      </div>
    )
  }

  render() {

    let headerData = {
      title: {
        display: this.props.data.circle,
        style: "mono"
      },
      icon: 'icon-stream-chat',
      actions: {
        subscribe: null,
        details: '',
      },
      breadcrumbs: [{
        display: this.props.data.host,
        href: '/~profile/' + this.props.data.host
      }]
    }

    let headerContent = this.buildHeaderContent(headerData);

    return headerContent;
  }
}

