import { api } from '/api';
import _ from 'lodash';
import Mousetrap from 'mousetrap';
import { warehouse } from '/warehouse';
import { isDMStation, getMessageContent } from '/lib/util';
import { getStationDetails, pruneMessages } from '/services';
import { REPORT_PAGE_STATUS, PAGE_STATUS_DISCONNECTED, PAGE_STATUS_PROCESSING, PAGE_STATUS_READY, INBOX_MESSAGE_COUNT } from '/lib/constants';
import urbitOb from 'urbit-ob';

const LONGPOLL_TIMEOUT = 15000;
const LONGPOLL_TRYAGAIN = 30000;

/**
  Response format

  {
    data: {
      json: {
        circle: {   // *.loc for local, *.rem for remote
          cos:      // config
          pes:      // presence
          nes:      // messages
          gram:     // message (individual)
        }
        circles:    // circles you own
        public:     // circles in your public membership list
        client: {
          gys:      // glyphs
          nis:      // nicknames
        }
        peers:      // subscribers to your circles
        status:     // rumor, presence -- TODO?
      }
    }
    from: {
      path:    // Subscription path that triggered response
      ship:    // Subscription requestor
    }
  }
**/

export class UrbitOperator {
  constructor() {
    this.seqn = 1;
    this.disconnectTimer = null;
  }

  start() {
    if (api.authTokens) {
      this.initializeLandscape();
      this.bindShortcuts();
      this.setCleanupTasks();
    } else {
      console.error("~~~ ERROR: Must set api.authTokens before operation ~~~");
    }
  }

  setCleanupTasks() {
    window.addEventListener("beforeunload", e => {
      api.bindPaths.forEach(p => {
        this.wipeSubscription(p);
      });
    });
  }

  wipeSubscription(path) {
    api.hall({
      wipe: {
        sub: [{
          hos: api.authTokens.ship,
          pax: path
        }]
      }
    });
  }

  bindShortcuts() {
    Mousetrap.bind(["mod+k"], () => {
      warehouse.storeReports([{
        type: "menu.toggle"
      }]);

      return false;
    });
  }

  initializeLocalStorage() {
    warehouse.pushCallback('landscape.prize', rep => {
      let uids = Object.values(rep.data.dms).flatMap(m => m.messages).map(m => m.gam.uid);

      if (!warehouse.localGet('dms-seen')) {
        warehouse.localSet('dms-seen', uids);
      }
    });
  }

  notifyDMs(msgs) {
    let prunedMsgs = pruneMessages(msgs);
    let seenDms = warehouse.localGet('dms-seen');

    let newDms = prunedMsgs
                  .filter(m => {
                    let isDm = m.stationDetails.type === "stream-dm";
                    let fromOther = m.aud !== api.authTokens.ship;
                    let unseen = !seenDms.includes(m.uid);

                    return isDm && fromOther && unseen;
                  });

    if (newDms.length > 0) {
      warehouse.storeReports([{
        type: 'dm.new',
        data: newDms
      }]);
    }

    return false;
  }

  initializeLandscape() {
    this.initializeLocalStorage();

    api.bind(`/primary`, "PUT", api.authTokens.ship, 'collections',
      this.handleEvent.bind(this),
      this.handleError.bind(this));

    warehouse.pushCallback(['circle.gram', 'circle.nes', 'landscape.prize'], (rep) => {
      let msgs = [];

      switch (rep.type) {
        case "circle.gram":
          msgs = [rep.data];
          break;
        case "circle.nes":
          msgs = rep.data;
          break;
        case "landscape.prize":
          msgs = rep.data.inbox.messages;
          break;
      }

      this.notifyDMs(msgs);

      return false;
    });

    warehouse.pushCallback('landscape.prize', (rep) => {
      warehouse.storeReports([{
        type: REPORT_PAGE_STATUS,
        data: PAGE_STATUS_READY
      }]);
    });
  }

  handleEvent(diff) {
    console.log('handleEvent', diff);
    if (warehouse.store.views.transition === PAGE_STATUS_DISCONNECTED) {
      warehouse.storeReports([{
        type: REPORT_PAGE_STATUS,
        data: PAGE_STATUS_READY
      }]);
    }

    warehouse.storePollResponse(diff);
  }

  handleError(err) {
      warehouse.storeReports([{
        type: REPORT_PAGE_STATUS,
        data: PAGE_STATUS_DISCONNECTED
      }]);

    /*  TODO: if we time out, you're out of luck
     *
        if (this.disconnectTimer) clearTimeout(this.disconnectTimer);

     this.disconnectTimer = setTimeout(() => {
      warehouse.storeReports([{
        type: REPORT_PAGE_STATUS,
        data: PAGE_STATUS_DISCONNECTED
      }]);
    }, LONGPOLL_TIMEOUT);*/

    console.log(err);
    api.bind(`/primary`, "PUT", api.authTokens.ship, 'collections',
      this.handleEvent.bind(this),
      this.handleError.bind(this));
  }
}

export let operator = new UrbitOperator();
window.operator = operator;
