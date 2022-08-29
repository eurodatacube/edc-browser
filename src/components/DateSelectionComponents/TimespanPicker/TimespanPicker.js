import React, { Component } from 'react';

import { DateTimeInput } from './DateTimeInput';
import './TimespanPicker.scss';

export class TimespanPicker extends Component {
  state = {
    fromTime: null,
    toTime: null,
    sharedMaxCloudCover: 100,
  };

  componentDidMount() {
    this.handleTimespan();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.timespan !== this.props.timespan) {
      this.handleTimespan();
    }
  }

  handleTimespan = () => {
    const { fromTime, toTime } = this.props.timespan;
    this.setState({
      fromTime: fromTime.clone(),
      toTime: toTime.clone(),
    });
  };

  apply = () => {
    const { fromTime, toTime } = this.state;
    this.props.applyTimespan(fromTime, toTime);
  };

  setFromTime = (time) => {
    const { autoApply } = this.props;
    this.setState(
      {
        fromTime: time.clone(),
      },
      autoApply ? this.apply : undefined,
    );
  };

  setToTime = (time) => {
    const { autoApply } = this.props;
    this.setState(
      {
        toTime: time.clone(),
      },
      autoApply ? this.apply : undefined,
    );
  };

  setSharedMaxCloudCover = (value) => this.setState({ sharedMaxCloudCover: value });

  render() {
    const { fromTime, toTime, sharedMaxCloudCover } = this.state;
    const { id, autoApply, onQueryDatesForActiveMonth, hasCloudCoverage } = this.props;

    return (
      <div className="timespan-picker">
        <div className="date-picker-calendar-wrap">
          <DateTimeInput
            id={`${id}-from`}
            label={'From:'}
            calendarContainer={this.calendarHolder1}
            selectedTime={fromTime}
            setSelectedTime={this.setFromTime}
            minDate={this.props.minDate}
            maxDate={toTime}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            hasCloudCoverage={hasCloudCoverage}
            timespanExpanded={true}
            sharedMaxCloudCover={sharedMaxCloudCover}
            setSharedMaxCloudCover={this.setSharedMaxCloudCover}
          />
          <div className="timespan-calendar-holder" ref={(e) => (this.calendarHolder1 = e)} />
        </div>

        <div className="date-picker-calendar-wrap">
          <DateTimeInput
            id={`${id}-to`}
            label={'Until:'}
            calendarContainer={this.calendarHolder2}
            selectedTime={toTime}
            setSelectedTime={this.setToTime}
            minDate={fromTime}
            maxDate={this.props.maxDate}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            hasCloudCoverage={hasCloudCoverage}
            timespanExpanded={true}
            sharedMaxCloudCover={sharedMaxCloudCover}
            setSharedMaxCloudCover={this.setSharedMaxCloudCover}
          />

          <div className="timespan-calendar-holder" ref={(e) => (this.calendarHolder2 = e)} />
        </div>
        {!autoApply && (
          <div className="apply-button">
            <button className="btn button-primary" onClick={this.apply}>
              Apply
            </button>
          </div>
        )}
      </div>
    );
  }
}
