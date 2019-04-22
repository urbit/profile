import _ from 'lodash';
import { PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, REPORT_PAGE_STATUS, REPORT_NAVIGATE } from '/lib/constants';
import React from 'react';
import ReactDOM from 'react-dom';
import { Root } from '/components/root';


const REPORT_KEYS = [
  REPORT_PAGE_STATUS,
  REPORT_NAVIGATE,
  'menu.toggle'
]

class UrbitWarehouse {
  constructor() {
    this.store = {
      messages: {
        inbox: {
          src: [],
          messages: [],
          config: {}
        },
        notifications: [],
        stations: {}
      },
      configs: {},
      views: {
        transition: PAGE_STATUS_READY,
        inbox: "inbox-recent",
        activeStream: null,
      },
      reads: {},
      names: {},
      public: {},
      circles: [],
      dms: {
        stored: false,
        stations: []
      },
    };

    this.reports = this.buildReports();

    this.storeReports = this.storeReports.bind(this);
    this.pushCallback = this.pushCallback.bind(this);
  }

  buildReports() {
    let reports = {};

    REPORT_KEYS.forEach((type) => {
      // TOOD: dataKeys are here because report fragments don't contain all the
      // data we need to process; sometimes we need to grab the whole chain
      let [reportKey, dataKey] = type.split("/");

      reports[reportKey] = {
        callbacks: [],
        dataKey: (dataKey) ? dataKey : reportKey
      }
    })

    return reports;
  }

  storePollResponse(data) {
    let newReports = [];
    let reportTypes = Object.keys(this.reports);
    let json = data.data;

    reportTypes.forEach((type) => {
      let reportData = _.get(json, type, null);

      let hasContent = (
        (_.isArray(reportData) && _.isEmpty(reportData)) ||
        (_.isObject(reportData) && _.isEmpty(reportData)) ||
        (reportData !== null)
      );

      if (hasContent) {
        // TODO: Actually grab the data again, "up the chain", for when
        // fragments don't contain all the data we need
        reportData = _.get(json, this.reports[type].dataKey, null);

        newReports.push({
          type: type,
          data: reportData,
          from: data.from
        });
      }
    });

    this.storeReports(newReports);
  }

  storeReports(newReports) {
    newReports.forEach((rep) => console.log('new report: ', rep));
    console.log('full store = ', this.store);

    this.processPending(newReports);
    ReactDOM.render(<Root />, document.querySelectorAll("#root")[0]);
  }

  processPending(reports) {
    reports.forEach((rep) => {
      let reportBucket = this.reports[rep.type];
      let clearIndexes = [];

      reportBucket.callbacks.forEach((callback, i) => {
        let callSuccess = callback(rep);
        // callbacks should return true, or _nothing_ to be considered complete)
        // default behavior is return nothing; complete on first keyed response
        if (callSuccess === true || typeof callSuccess === "undefined") {
          clearIndexes.push(i);
        }
      });

      _.pullAt(reportBucket.callbacks, clearIndexes);
    })
  }


  pushCallback(key, callback) {
    if (typeof key === "string") {
      this.reports[key].callbacks.push(callback);
    } else if (_.isArray(key)) {
      key.forEach(k => {
        this.reports[k].callbacks.push(callback);
      });
    }
  }

  /* LocalStorage functions */

  localSet(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
  }

  localGet(key) {
    return JSON.parse(window.localStorage.getItem(key));
  }
}

export let warehouse = new UrbitWarehouse();
window.warehouse = warehouse;
