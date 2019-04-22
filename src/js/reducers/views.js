import { REPORT_PAGE_STATUS, REPORT_NAVIGATE, PAGE_STATUS_DISCONNECTED, PAGE_STATUS_READY, PAGE_STATUS_RECONNECTING } from '/lib/constants';

export class ViewsReducer {
  reduce(reports, store) {
    reports.forEach((rep) => {
      switch (rep.type) {
        case REPORT_PAGE_STATUS:
          // Don't let any state other than "READY" or "RECONNECTNG" override the disconnected state
          // let isDisconnected = store.views.transition === PAGE_STATUS_DISCONNECTED;
          // let readyOrReconnecting = rep.data === PAGE_STATUS_READY || rep.data === PAGE_STATUS_RECONNECTING;
          //
          // if (!isDisconnected || readyOrReconnecting) {
          //   store.views.transition = rep.data;
          // }

          store.views.transition = rep.data;
          break;

        case REPORT_NAVIGATE:
          store.views[rep.data.page] = rep.data.view;
          break;

        case "views.streamActive":
          store.views.streamActive = rep.data;
          break;
      }
    });
  }
}
