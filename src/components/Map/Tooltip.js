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
        <div className="single-geometry-data">
          {info.map(({ properties }, i) => (
            <table key={i}>
              <tbody>
                {Object.keys(properties).map((key, j) => (
                  <tr className="data-property" key={j}>
                    <td className="property-name">{key}</td>
                    <td className="property-value">{properties[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>,
      holderRef,
    );
  }
}

export default onClickOutside(Tooltip);
