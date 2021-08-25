import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

import './InfoTooltip.scss';

class InfoTooltip extends Component {
  state = {
    tooltipOpen: false,
  };

  handleClickOutside = () => this.setState({ tooltipOpen: false });

  render() {
    const { tooltipOpen } = this.state;
    const { text } = this.props;
    return (
      <div className="info-tooltip">
        <i
          className="fas fa-info-circle tooltip-icon"
          onClick={() => this.setState((prevState) => ({ tooltipOpen: !prevState.tooltipOpen }))}
        />
        {tooltipOpen && <div className="info-tooltip-text">{text}</div>}
      </div>
    );
  }
}

export default onClickOutside(InfoTooltip);
