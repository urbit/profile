import Mousetrap from 'mousetrap';

export class UrbitOperator {
  constructor() {
  }

  start() {
    if (api.authTokens) {
      this.bindShortcuts();
    } else {
      console.error("~~~ ERROR: Must set api.authTokens before operation ~~~");
    }
  }

  bindShortcuts() {
    Mousetrap.bind(["mod+k"], () => {
      warehouse.storeReports([{
        type: "menu.toggle"
      }]);

      return false;
    });
  }

}

export let operator = new UrbitOperator();
window.operator = operator;
