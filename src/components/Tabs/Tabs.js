import React, { Component } from 'react';

import './Tabs.scss';

export class Tabs extends Component {
  handleSelect = (renderKey) => {
    this.props.onSelect(renderKey);
  };

  renderTabButtons = () => {
    return (
      <ul className="tab-list">
        {this.props.children.map(
          /* Note that we are accessing childrens' props here. This breaks encapsulation principles,
           but allows us to declare tabs in a nicer way (we can define props directly on each tab)*/
          (tab) => {
            return (
              <li
                id={`${tab.props.id}-button`}
                key={tab.props.renderKey}
                value={tab.props.renderKey}
                onClick={() => tab.props.enabled && this.handleSelect(tab.props.renderKey)}
                className={`tab ${this.props.activeIndex === tab.props.renderKey ? 'tab-selected' : ''}`}
                disabled={!tab.props.enabled}
              >
                <span className="tab-text">{tab.props.title}</span>
              </li>
            );
          },
        )}
      </ul>
    );
  };

  renderContent() {
    return this.props.children.map((pane, index) => (
      <div id={pane.props.id} key={pane.props.renderKey} className="tab-panel-container">
        <div className={pane.props.renderKey === this.props.activeIndex ? 'active' : 'none'}>{pane}</div>
      </div>
    ));
  }

  render() {
    return (
      <div className="tabs-container">
        {this.renderTabButtons()}
        {this.renderContent()}
      </div>
    );
  }
}

export class Tab extends Component {
  static defaultProps = {
    enabled: true,
  };

  render() {
    return this.props.children;
  }
}
