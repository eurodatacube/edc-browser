import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import onClickOutside from 'react-onclickoutside';

class Tooltip extends Component {
  handleClickOutside = () => this.props.onClose();

  render() {
    const {
      tooltip: { left, top, info },
      holderRef,
    } = this.props;
    return ReactDOM.createPortal(
      <div className="vector-data-tooltip" style={{ left: left, top: top }}>
        {info.map(({ properties }, i) => (
          <div className="single-geometry-data" key={i}>
            {Object.keys(properties).map((key, j) => (
              <div className="data-property" key={j}>
                {key}: {properties[key]}
              </div>
            ))}
          </div>
        ))}
      </div>,
      holderRef,
    );
  }
}

export default onClickOutside(Tooltip);
