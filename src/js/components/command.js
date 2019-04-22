import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { PageStatus } from '/components/lib/page-status';
import { CommandHelpItem } from '/components/command/help-item';
import { Icon } from '/components/lib/icon';
import { isDMStation, isValidStation, profileUrl } from '/lib/util';
import { getStationDetails } from '/services';
import { PAGE_STATUS_TRANSITIONING, STATUS_READY, LANDSCAPE_ROOT } from '/lib/constants';
import urbitOb from 'urbit-ob';
import _ from 'lodash';

const DEFAULT_PLACEHOLDER = "type a command, page or ? for help";

export class CommandMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: "command",
      command: "",
      options: [],
      status: STATUS_READY,
      selectedOption: null
    };

    this.cancelView = this.cancelView.bind(this);
    this.closeMenu = this.closeMenu.bind(this);

    this.commandInputRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.commandInputRef.current) this.commandInputRef.current.focus();
  }

  componentDidMount() {
    if (this.state.options.length === 0) {
      this.setState({
        options: this.getOptionList(this.state.command)
      });
    }

    Mousetrap.bind('down', (e) => {
      if (this.commandInputDisabled()) return;

      let option;
      if (e.preventDefault) e.preventDefault();

      if (this.state.selectedOption === null) {
        option = 0
      } else if (this.state.selectedOption === (this.state.options.length - 1)) {
        option = (this.state.options.length - 1);
      } else {
        option = this.state.selectedOption + 1;
      }

      this.setState({
        selectedOption: option
      });
    });

    Mousetrap.bind('up', (e) => {
      if (this.commandInputDisabled()) return;

      let option;
      if (e.preventDefault) e.preventDefault();

      if (this.state.selectedOption === null || this.state.selectedOption === 0) {
        option = 0;
      } else {
        option = this.state.selectedOption - 1;
      }

      this.setState({
        selectedOption: option
      });
    });

    Mousetrap.bind('enter', (e) => {
      if (this.commandInputDisabled()) return;
      if (this.state.selectedOption !== null) {
        this.processCommand(this.state.options[this.state.selectedOption]);
        this.autoComplete();
      }
    });

    Mousetrap.bind('esc', (e) => {
      if (this.state.view !== "command") {
        this.cancelView();
      } else {
        this.props.storeReports([{
          type: "menu.toggle",
          data: {open: false}
        }]);
      }
    });

    Mousetrap(this.commandInputRef.current).bind('tab', (e) => {
      if (this.commandInputDisabled()) return;

      if (e.preventDefault) e.preventDefault();
      this.autoComplete();
    });
  }

  closeMenu() {
    this.props.storeReports([{
      type: "menu.toggle",
      data: {open: false}
    }]);
  }

  autoComplete() {
    let placeholder = this.getPlaceholder();

    if (placeholder !== DEFAULT_PLACEHOLDER && placeholder !== "") {
      this.updateCommand(placeholder, false);
    }
  }

  componentWillUnmount() {
    Mousetrap.unbind('down');
    Mousetrap.unbind('up');
    Mousetrap.unbind('enter');
    Mousetrap.unbind('tab');
    Mousetrap.unbind('esc');
  }

  updateCommand(cmd, reselect) {
    let newState = {
      command: cmd,
      options: this.getOptionList(cmd)
    }

    if (reselect) newState.selectedOption = 0;

    this.setState(newState);
  }

  hasHelpToken(cmd) {
    return cmd.split(" ").includes("?");
  }

  processCommand(option) {
    if (typeof option.action === "string") {
      this.updateCommand(option.action, true)
    } else if (typeof option.action === "function") {
      option.action();
    }
  }

  getDirectiveOptionsList() {
    return {
      go: this.getGoOptionList(),
      dm: this.getDmOptionList(),
      "new": this.getNewOptionList()
    };
  }

  getGoOptionList() {
    let options = [];

    Object.arrayify(this.props.store.names).forEach(({key: ship, value: stations}) => {
      stations.forEach(station => {
        let stationName = `~${ship}/${station}`;
        if (isDMStation(stationName) || stationName.includes('inbox') || getStationDetails(stationName).type === 'text-topic') return;
        options.push(this.buildGoOption(stationName));
      });

      options.push(this.buildGoOption(`~${ship}`));
    });

    return options;
  }

  // term can be '~marzod' or '~marzod/testnet-meta'
  buildGoOption(term) {
    let isValidPatp = urbitOb.isValidPatp(term.substr(1));
    let isStation = isValidStation(term);
    let details = isStation && getStationDetails(term);
    // use collection description if it's a collection
    let displayTextTerm = isStation ? details.type == 'text' ? `${details.station.split("/")[0]} / ${details.stationTitle}` : details.station.split("/").join("  /  ") : term;

    let displayText = `go ${displayTextTerm}`;
    let helpText = isStation ?
      `Go to ${details.cir} on ~${details.host}` :
      `Go to the profile of ${term}`

    return {
      name: `go ${term}`,
      action: () => {
        let targetUrl;
        if (isValidPatp) {
          targetUrl = profileUrl(term.substr(1))
          window.location.href = targetUrl;
        } else if (isStation) {
          targetUrl = (details.type === "text-topic") ? details.postUrl : details.stationUrl
          window.location.href = targetUrl;
        }
      },
      displayText,
      helpText
    };
  }

  getDmOptionList() {
    let options = [];

    Object.keys(this.props.store.names).forEach(name => {
      options.push(this.buildDmOption(`~${name}`));
    });

    return options;
  }

  buildDmOption(name) {
    return {
      name: `dm ${name}`,
      action: () => {
        let aud = name.split(", ");
        let audValid = aud.every(urbitOb.isValidPatp);

        if (audValid) {
          let members = [this.props.api.authTokens.ship, ...aud.map(a => a.substr(1))];
          let station = `~${this.props.api.authTokens.ship}/${members.sort().join(".")}`;
          let stationDetails = getStationDetails(station);

          window.location.href = stationDetails.stationUrl;
        }
      },
      displayText: `dm ${name}`,
      helpText: `Send a direct message to ${name}`
    }
  }

  getNewOptionList() {
    return [{
      name: "new collection",
      action: () => {
        this.setState({
          view: "collection-create"
        });
      },
      displayText: "new collection",
      helpText: "Create a new collection of markdown files"
    }, {
      name: "new chat",
      action: () => {
        this.setState({
          view: "stream-create"
        });
      },
      displayText: "new chat",
      helpText: "Create a chatroom"
    }];
  }

  getRootOptionList() {
    return [{
      name: "inbox",
      action: () => {
        window.location.href = '/~inbox';
      },
      displayText: "inbox",
      helpText: "Go to the inbox",
    }, {
      name: "profile",
      action: () => {
        window.location.href = `/~landscape/profile/~${window.ship}`;
      },
      displayText: "profile",
      helpText: "Go to your profile. Settings and log out are also here",
    }, {
      name: "go",
      action: "go ~",
      displayText: "go [~ship/chat]",
      helpText: "Go to <stream> on <~ship>",
    }, {
      name: "go",
      action: "go ~",
      displayText: "go [~ship/collection]",
      helpText: "Go to <collection> on <~ship>",
    }, {
      name: "dm",
      action: "dm ~",
      displayText: "dm [~ship]",
      helpText: "Go to your dm with <~ship>, or start a new dm with <~ship>",
    }, {
      name: "dm",
      action: "dm ~",
      displayText: "dm [~ship-a, ~ship-b, ~ship-c]",
      helpText: "Go to your dm with a group of <[~ship-a, ~ship-b, ~ship-c]>, or start a new dm with <[~ship-a, ~ship-b, ~ship-c]>",
    }, {
      name: "new",
      action: "new",
      displayText: "new [type]",
      helpText: "Create a new blog, forum, or chat",
    }];
  }

  getDirective(cmd, options) {
    let tokens = cmd.split(" ");
    let directive = tokens[0];

    // for 1st type, must be a valid directive *and* have a non-empty second token
    let hasSecondToken = (Object.keys(options).includes(directive)
                          && tokens.length > 1
                          && tokens[1] !== ""
                          && tokens[1] !== "?");

    if (hasSecondToken || directive === "new") {
      return directive;
    }
    return null;
  }

  addTentativeOption(cmd, directive) {
    let option;

    if (directive === "dm") {
      let name = cmd.substr(3);
      option = this.buildDmOption(name);
    } else if (directive === "go") {
      let name = cmd.split(" ")[1];
      option = this.buildGoOption(name);
    }

    return option;
  }

  getOptionList(cmd) {
    let options;

    let trimmedCmd = this.trimCmd(cmd);

    let directiveOptions = this.getDirectiveOptionsList();
    let directive = this.getDirective(trimmedCmd, directiveOptions);

    if (directive) {
      options = directiveOptions[directive];

      // if there are no options with the exact name of the current command,
      // create an extra option with the current command
      if (options.every(o => o.name !== trimmedCmd)) {
        let extraOption = this.addTentativeOption(trimmedCmd, directive);
        if (extraOption) options.push(extraOption);
      }
    } else {
      options = this.getRootOptionList();
    }

    options = options.filter(opt => opt.name.includes(trimmedCmd));

    // Filter out "new collection" and "new chat" options from default list of options
    if (!["new collection", "new chat"].includes(trimmedCmd)) {
      options = options.filter(opt => !opt.name.includes("new"))
    }

    return options;
  }

  trimCmd(cmd) {
    if (this.hasHelpToken(cmd)) {
      let tokens = cmd.split(" ");
      tokens.splice(tokens.indexOf("?"), 1);
      return tokens.join(" ").trim();
    }

    return cmd.trim();
  }

  buildOptions(optionList) {
    return optionList.map((option, index) => {
      let selected = index === this.state.selectedOption;
      let helpActivated = this.hasHelpToken(this.state.command);

      return (
        <CommandHelpItem
          option={option}
          selected={selected}
          key={option.displayText}
          processCommand={this.processCommand.bind(this)}
          helpActivated={helpActivated}
        />
      );
    });
  }

  getPlaceholder() {
    let currentOption = this.state.options[this.state.selectedOption];

    if (this.state.command === "") {
      return DEFAULT_PLACEHOLDER;
    } else if (this.state.command.includes("?")) {
      return "";
    } else if (currentOption && currentOption.name.startsWith(this.state.command)) {
      return currentOption.name
    }
  }

  cancelView() {
    this.updateCommand("", true);
    this.setState({
      view: "command"
    });
  }

  commandInputDisabled() {
    return (
      this.state.view === "collection-create" ||
      this.state.view === "stream-create" ||
      this.props.store.views.transition === PAGE_STATUS_TRANSITIONING ||
      this.state.status !== STATUS_READY
    )
  }

  render() {
    let view, placeholder, commandInputDisabled;

    if (this.state.view === "command") {
      placeholder = this.getPlaceholder();
      view = this.buildOptions(this.state.options);
    }

    commandInputDisabled = this.commandInputDisabled();

    return (
      <div className="container command-page">
        <PageStatus
          transition={this.props.store.views.transition}
          usership={this.props.api.authTokens.ship}
          storeReports={this.props.storeReports}
        />
        <div className="row command-row">
          <div className="flex-col-1"></div>
          <div className="flex-col-1 justify-start" onClick={this.closeMenu}>
            <Icon type="icon-x" />
          </div>
          <div className="flex-col-x">
            <div className="command-input-placeholder-wrapper"
               data-placeholder={placeholder}
               disabled={commandInputDisabled}>
              <input type="text"
                     name="command-input"
                     className="command-menu-input"
                     disabled={commandInputDisabled}
                     onChange={(e) => this.updateCommand(e.target.value, true)}
                     onSubmit={this.onCommandSubmit}
                     value={this.state.command}
                     ref={this.commandInputRef}/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="flex-col-2"></div>
          <div className="flex-col-x command-options">
            {view}
          </div>
        </div>
      </div>
    );
  }
}
