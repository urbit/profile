import React, { Component } from 'react';
import { Icon } from '/components/lib/icon';
import { getQueryParams, profileUrl, dateToDa } from '/lib/util';
import { Button } from '/components/lib/button';
import { PageStatus } from '/components/lib/page-status';
import { REPORT_PAGE_STATUS, REPORT_NAVIGATE, PAGE_STATUS_TRANSITIONING, PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, PAGE_STATUS_RECONNECTING, PAGE_STATUS_DISCONNECTED, LANDSCAPE_ROOT } from '/lib/constants';
import classnames from 'classnames';
import _ from 'lodash';

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

  getHeaderData() {
    let headerData = {
      icon: 'icon-sig',
      title: {
        display: this.props.data.author.substr(1),
        href: profileUrl(this.props.data.author.substr(1)),
        style: "mono"
      }
    }

    return headerData;
  }

  buildHeaderCarpet(headerData) {
    let indexClass = classnames({
      'vanilla': true,
      'mr-8': true,
      'inbox-link': true,
      'inbox-link-active': true,
    });
    return (
      <React.Fragment>
        <div className="flex-col-2"></div>
        <div className="flex-col-x text-heading text-squat">
          <a className={indexClass} href={`/~landscape/collections/${this.props.data.author}/profile`}>Profile</a>
        </div>
      </React.Fragment>
    );
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
    let subscribeClass, breadcrumbsElem, headerClass,
      headerCarpet;

    breadcrumbsElem = this.buildHeaderBreadcrumbs(headerData);
    headerCarpet = this.buildHeaderCarpet(headerData);

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
          <div className="flex-col-1 flex justify-end"></div>
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
        <div className="row header-carpet">
          {headerCarpet}
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
    let headerData = this.getHeaderData();
    let headerContent = this.buildHeaderContent(headerData);

    return headerContent;
  }
}

