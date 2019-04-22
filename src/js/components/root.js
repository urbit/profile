import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";

import { CommandMenu } from '/components/command';
import { Header } from '/components/header';
import { ChatPage } from '/components/chat';

import { api } from '/api';
import { warehouse } from '/warehouse';

export class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false
    };

    warehouse.pushCallback("menu.toggle", (rep) => {
      let newStatus = (rep.data) ? rep.data.open : !this.state.menuOpen;

      this.setState({
        menuOpen: newStatus
      });

      return false;
    });
  }

  loadHeader(type) {
    let headerData = {
      type: "default"
    }

    return (
      <Header
        data={headerData}
        api={api}
        store={warehouse.store}
        storeReports={warehouse.storeReports}
        pushCallback={warehouse.pushCallback}
        localSet={warehouse.localSet}
        localGet={warehouse.localGet}
      />
    );
  }

  render() {
    let content;

    if (this.state.menuOpen) {
      content = (
        <CommandMenu
          api={api}
          store={warehouse.store}
          storeReports={warehouse.storeReports}
          pushCallback={warehouse.pushCallback}
        />
      )
    } else {
      console.log('render root');
      content = (
       <BrowserRouter>
         <div>
          <Route exact path="/~chat"
            render={ (props) => {
              return (
                <div>
                  {this.loadHeader('all')}
                  <InboxAllPage 
                    api={api}
                    store={warehouse.store}
                    storeReports={warehouse.storeReports}
                    pushCallback={warehouse.pushCallback}
                  />
                </div>
              );
            }} />
          <Route exact path="/~chat/:ship/:station"
            render={ (props) => {
              return (
                <ChatPage 
                  api={api}
                  store={warehouse.store}
                  storeReports={warehouse.storeReports}
                  pushCallback={warehouse.pushCallback}
                  localGet={warehouse.localGet}
                  localSet={warehouse.localSet}
                  {...props}
                />
              );
            }} />
        </div>
      </BrowserRouter>
      )
    }

    return content;
  }

}
