import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";

import { CommandMenu } from '/components/command';
import { ProfilePage } from '/components/profile';

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
      content = (
       <BrowserRouter>
         <div>
          <Route exact path="/~profile/:ship"
            render={ (props) => {
              return (
                <ProfilePage 
                  api={api}
                  store={warehouse.store}
                  storeReports={warehouse.storeReports}
                  pushCallback={warehouse.pushCallback}
                  {...props} />
              );
            }} />
        </div>
      </BrowserRouter>
      )
    }

    return content;
  }

}
