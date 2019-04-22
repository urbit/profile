import React, { Component } from 'react';
import { STATUS_LOADING, STATUS_READY } from '/lib/constants';

export class Button extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: STATUS_READY
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.focusChange = this.focusChange.bind(this);
  }

  onSubmit(e) {
    if (e.preventDefault) e.preventDefault();

    this.setState({ status: STATUS_LOADING });

    this.props.action(this.props.actionData);

    if (this.props.responseKey) {
      this.props.pushCallback(this.props.responseKey, (rep) => {
        this.setState({ status: STATUS_READY });
      });
    }
  }

  focusChange(e) {
    if (this.props.focusChange) this.props.focusChange(e);
    return true;
  }

  render() {
    let spinnerClass = (this.state.status !== STATUS_LOADING) ? "hide" : "btn-spinner";
    let content = typeof(this.props.content) === "function"? React.createElement(this.props.content) : this.props.content;

    return (
      <form
        style={{display: 'inline-block'}}
        onSubmit={this.onSubmit}>

        <button type="submit"
          className={this.props.classes}
          disabled={this.props.disabled}
          onFocus={this.focusChange}>

          <span>{content}</span>
          <span className={spinnerClass}></span>
        </button>
      </form>
    )
  }
}
