import React, { Component } from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { TimespanPicker } from '../TimespanPicker/TimespanPicker';
import './VisualizationTimeSelect.scss';

export class VisualizationTimeSelect extends Component {
  state = {
    timespanExpanded: this.props.timespanExpanded || false,
  };

  updateTimespan = (fromTime, toTime) => {
    this.props.updateSelectedTime(fromTime, toTime);
  };

  updateDate = (date) => {
    const fromTime = date.clone().startOf('day');
    const toTime = date.clone().endOf('day');
    this.props.updateSelectedTime(fromTime, toTime);
  };

  toggleTimespan = () => {
    this.setState(
      (prevState) => {
        return { timespanExpanded: !prevState.timespanExpanded };
      },
      () => {
        if (!this.state.timespanExpanded) {
          this.updateDate(this.props.toTime);
        }
      },
    );
  };

  render() {
    const {
      maxDate,
      minDate,
      onQueryDatesForActiveMonth,
      showNextPrev,
      maxCloudCover,
      fromTime,
      toTime,
      timespanSupported,
      onQueryFlyoversForActiveMonth,
      hasCloudCoverage,
    } = this.props;

    const { timespanExpanded } = this.state;
    if (!toTime) {
      return null;
    }

    if (!timespanSupported) {
      return (
        <>
          <div className="visualization-time-select">
            <div>
              <b className="time-select-type">Date</b>
            </div>
            <DatePicker
              id="visualization-date-picker"
              calendarContainer={this.calendarHolder}
              selectedDay={toTime.clone().startOf('day')}
              setSelectedDay={this.updateDate}
              minDate={minDate}
              maxDate={maxDate}
              showNextPrevDateArrows={showNextPrev}
              onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            />
            <div />
          </div>
          <div className="visualization-calendar-holder" ref={(e) => (this.calendarHolder = e)} />
        </>
      );
    }

    return (
      <>
        <div className="visualization-time-select">
          <div>
            <b className="time-select-type">{timespanExpanded ? 'Timespan:' : 'Date:'}</b>
            {!timespanExpanded &&
              (hasCloudCoverage ? (
                <DatePicker
                  id="cloud-cover-datepicker-wrap"
                  calendarContainer={this.calendarHolder}
                  selectedDay={toTime.clone().utc().startOf('day')}
                  setSelectedDay={this.updateDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  showNextPrevDateArrows={showNextPrev}
                  onQueryDatesForActiveMonth={onQueryFlyoversForActiveMonth}
                  hasCloudCoverFilter={true}
                  setMaxCloudCover={(value) => this.setState({ setMaxCloudCover: value })}
                  maxCloudCover={maxCloudCover}
                />
              ) : (
                <DatePicker
                  id="visualization-date-picker"
                  calendarContainer={this.calendarHolder}
                  selectedDay={toTime.clone().utc().startOf('day')}
                  setSelectedDay={this.updateDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  showNextPrevDateArrows={showNextPrev}
                  onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
                />
              ))}
          </div>
          {timespanExpanded && (
            <div className="timespan-title-wrap">
              <div className="timespan-label" onClick={this.toggleTimespan}>
                {`${fromTime.clone().utc().format('YYYY-MM-DD HH:mm')} - ${toTime
                  .clone()
                  .utc()
                  .format('YYYY-MM-DD HH:mm')}`}
              </div>
            </div>
          )}
          <div className="timespan-toggle" onClick={this.toggleTimespan}>
            {timespanExpanded ? 'Single date' : 'Timespan'}
          </div>
        </div>
        {timespanExpanded && (
          <TimespanPicker
            id="visualization-time-select"
            minDate={minDate}
            maxDate={maxDate}
            timespan={{ fromTime: fromTime, toTime: toTime }}
            applyTimespan={this.updateTimespan}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          />
        )}
        <div className="visualization-calendar-holder" ref={(e) => (this.calendarHolder = e)} />
      </>
    );
  }
}
