import React from 'react';
import RCSlider from 'rc-slider';

import 'rc-slider/assets/index.css';
import './CCSlider.scss';
import InfoTooltip from '../InfoTooltip/InfoTooltip';

export class CCSlider extends React.Component {
  static defaultProps = {
    sliderWidth: 50,
    cloudCoverPercentage: 100,
    onChange: (value) => {},
    min: 0,
    max: 100,
    showIcons: true,
    unit: '%',
  };

  render() {
    return (
      <div className="cc-slider">
        {this.props.showIcons && <i className="fa fa-sun-o">&nbsp;</i>}
        <div className="rcStyler" style={{ width: this.props.sliderWidth }}>
          <RCSlider
            min={this.props.min}
            max={this.props.max}
            step={1}
            defaultValue={this.props.cloudCoverPercentage}
            onChange={this.props.onChange}
          />
        </div>
        {this.props.showIcons && <i className="fa fa-cloud">&nbsp;</i>}
        <span className="percentage">
          {this.props.cloudCoverPercentage}&nbsp;{this.props.unit ? this.props.unit : ''}
        </span>
        {this.props.showSliderTooltip && (
          <InfoTooltip
            text={
              'The max. cloud coverage slider filters the available dates in the calendar to match the selected threshold. The dates must be selected manually afterwards (when in timespan in the from- and until-date picker).'
            }
            setOpenTooltipId={() => null}
          />
        )}
      </div>
    );
  }
}
