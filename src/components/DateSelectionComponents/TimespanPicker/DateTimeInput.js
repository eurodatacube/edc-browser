import React, { Component } from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { NumericInput } from './NumericInput';

export class DateTimeInput extends Component {
  setDay = (day) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime
      .clone()
      .set({ date: day.get('date'), month: day.get('month'), year: day.get('year') });
    this.props.setSelectedTime(newSelectedTime);
  };

  setHours = (hours) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime.clone().hours(hours);
    if (!this.isWithinAvailableRange(newSelectedTime)) {
      return;
    }
    this.props.setSelectedTime(newSelectedTime);
  };

  setMinutes = (minutes) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime.clone().minutes(minutes);
    if (!this.isWithinAvailableRange(newSelectedTime)) {
      return;
    }
    this.props.setSelectedTime(newSelectedTime);
  };

  isWithinAvailableRange = (newSelectedDay) => {
    const { minDate, maxDate } = this.props;
    return newSelectedDay >= minDate && newSelectedDay <= maxDate;
  };

  render() {
    const {
      id,
      selectedTime,
      label,
      calendarContainer,
      onQueryDatesForActiveMonth,
      hasCloudCoverage,
      timespanExpanded,
      sharedMaxCloudCover,
      setSharedMaxCloudCover,
    } = this.props;

    if (!selectedTime) {
      return null;
    }

    const hours = selectedTime.clone().utc().format('HH');
    const minutes = selectedTime.clone().utc().format('mm');

    return (
      <div className="date-time-input">
        <div className="date-input">
          <div className="date-time-input-label label-primary">{label}</div>
          <DatePicker
            id={id}
            calendarContainer={calendarContainer}
            selectedDay={selectedTime}
            setSelectedDay={this.setDay}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            hasCloudCoverFilter={hasCloudCoverage}
            timespanExpanded={timespanExpanded}
            sharedMaxCloudCover={sharedMaxCloudCover}
            setSharedMaxCloudCover={setSharedMaxCloudCover}
          />
        </div>
        <div className="time-input">
          <div className="time-input-section">
            <label htmlFor="" className="label-primary numeric-input-label">
              Hours
            </label>
            <NumericInput label={'hh'} min="0" max="23" value={hours} setValue={this.setHours} />
          </div>
          <div className="time-input-section">
            <label htmlFor="" className="label-primary numeric-input-label">
              Minutes
            </label>
            <NumericInput label={'mm'} min="0" max="59" value={minutes} setValue={this.setMinutes} />
          </div>
        </div>
      </div>
    );
  }
}
