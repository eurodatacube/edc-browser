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
    const { text, setOpenTooltipId, tooltipId, title } = this.props;
    return (
      <div>
        <div
          className={`info-tooltip ${tooltipOpen ? 'active' : ''}`}
          onClick={(evt) => {
            evt.stopPropagation();
            this.setState((prevState) => ({ tooltipOpen: !prevState.tooltipOpen }));
            setOpenTooltipId(tooltipId);
          }}
          title={title}
        >
          <i className="fas fa-info tooltip-icon" />
        </div>
        {tooltipOpen && (
          <div className="info-tooltip-text" onClick={(evt) => evt.stopPropagation()}>
            {text}
          </div>
        )}
      </div>
    );
  }
}

export default onClickOutside(InfoTooltip);
