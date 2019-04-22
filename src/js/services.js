import { profileUrl, isDMStation } from '/lib/util';
import { warehouse } from '/warehouse';
import { LANDSCAPE_ROOT } from '/lib/constants';
import { api } from '/api';

export function getStationDetails(station) {
  let host = station.split("/")[0].substr(1);
  let config = warehouse.store.configs[station];

  let ret = {
    type: "none",
    station: station,
    host: host,
    cir: station.split("/")[1],
    config: config,
    hostProfileUrl: profileUrl(host)
  };

  let circleParts = ret.cir.split("-");

  if (ret.cir === "inbox") {
    ret.type = "aggregator-inbox";
  } else if (ret.cir === "c") {
    ret.type = "aggregator";
  } else if (isDMStation(station)) {
    ret.type = "stream-dm";
  } else if (ret.cir.includes("c-") && circleParts.length > 2) {
    ret.type = "collection-post";
  } else if (ret.cir.includes("c-")) {
    ret.type = "collection-index";
  } else {
    ret.type = "stream-chat";
  }

  switch (ret.type) {
    case "aggregator-inbox":
      ret.stationUrl = LANDSCAPE_ROOT;
      ret.stationTitle = ret.cir;
      break;
    case "stream-chat":
      ret.stationUrl = `/~landscape/stream?station=${station}`;
      ret.stationDetailsUrl = `/~landscape/stream/details?station=${station}`;
      ret.stationTitle = ret.cir;
      break;
    case "stream-dm":
      ret.stationTitle = ret.cir
        .split(".")
        .filter((mem) => mem !== api.authTokens.ship)
        .map((mem) => `~${mem}`)
        .join(", ");;
      ret.stationUrl = `/~landscape/stream?station=${station}`;
      break;
    case "collection-index":
      ret.collId = circleParts[1];

      ret.stationUrl = `/~landscape/collections/~${ret.host}/${ret.collId}`;
      ret.stationTitle = config && config.extConf ? config.extConf.name : ret.collId;

      if (config && config.extConf) {
        ret.stationTitle = config.extConf.name;
      }

      if (config) {
        ret.stationTitle = config.cap;
      }

      break;
    case "collection-post":
      ret.collId = circleParts[1];
      ret.postId = circleParts[2];
      ret.stationUrl = `/~landscape/collections/~${ret.host}/${ret.collId}`;

      ret.parentCollectionUrl = `/~landscape/collections/~${ret.host}/${ret.collId}`;
      ret.parentCollectionUrl = `/~landscape/collections/~${ret.host}/${ret.collId}/${ret.postId}`;
      ret.stationTitle = config && config.extConf ? config.extConf.name : ret.collId;

      let collCircle = `~${ret.host}/c-${ret.collId}`;
      let collConfig = warehouse.store.configs[collCircle];
      ret.collTitle = collConfig && collConfig.extConf ? collConfig.extConf.name : ret.collId;
      break;
  }

  return ret;
}

export function getSubscribedStations(ship, store) {
  let inbox = store.messages.inbox;
  let configs = store.configs;

  // TODO: Maybe I need this?
  // if (!inbox) return null;

  let stationDetailList = inbox.src
    .map((station) => {
      if (!configs[station]) return null;
      return getStationDetails(station)
    })
    .filter((station) => station !== null);

  let ret = {
    chatStations: stationDetailList.filter((d) => d.type === "stream-chat"),
    collStations: stationDetailList.filter((d) => d.type === "collection-index"),
    dmStations: stationDetailList.filter((d) => d.type === "stream-dm"),
  };

  let numSubs = ret.chatStations.length + ret.collStations.length;
  let numDMs = ret.dmStations.length;

  let numString = [];
  if (numSubs > 0) numString.push(`${numSubs} subscriptions`);
  if (numDMs > 0) numString.push(`${numDMs} DMs`);

  ret.numString = numString.join(", ");

  return ret;
}

/*
  Does two things:
    1) truncates partner "auds" in DM messages to just return one message for your own DM circle
    2) split message's "aud" property into a separate message for each aud;
*/
export function pruneMessages(msgs) {
  let gams = msgs.map(m => m.gam);
  let msgAuds = _.flatMap(msgs.map(m => m.gam), m => Object.cloneByProperty(m, "aud"));
  return msgAuds.filter(m => {
    m.stationDetails = getStationDetails(m.aud[0]);
    return (m.stationDetails.type !== "stream-dm" || m.stationDetails.host === api.authTokens.ship)
  });
}

window.getStationDetails = getStationDetails
