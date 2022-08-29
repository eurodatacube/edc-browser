import React, { Component } from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { TimespanPicker } from '../TimespanPicker/TimespanPicker';
import Switch from '../../shared/Switch/Switch';

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
      fromTime,
      toTime,
      timespanSupported,
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
            <Switch checked={this.state.timespanExpanded} label="Timespan" onChange={this.toggleTimespan} />

            {!timespanExpanded && (
              <div>
                <label className="label-primary date-picker-label">Date</label>
                <DatePicker
                  id={hasCloudCoverage ? 'cloud-cover-datepicker-wrap' : 'visualization-date-picker'}
                  onQueryDatesForActiveMonth={
                    hasCloudCoverage
                      ? (toTime) => onQueryDatesForActiveMonth(toTime, true)
                      : onQueryDatesForActiveMonth
                  }
                  hasCloudCoverFilter={hasCloudCoverage}
                  calendarContainer={this.calendarHolder}
                  selectedDay={toTime.clone().utc().startOf('day')}
                  setSelectedDay={this.updateDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  showNextPrevDateArrows={showNextPrev}
                />
              </div>
            )}
          </div>
        </div>
        {timespanExpanded && (
          <TimespanPicker
            id="visualization-time-select"
            minDate={minDate}
            maxDate={maxDate}
            timespan={{ fromTime: fromTime, toTime: toTime }}
            applyTimespan={this.updateTimespan}
            onQueryDatesForActiveMonth={(toTime) =>
              hasCloudCoverage ? onQueryDatesForActiveMonth(toTime, true) : onQueryDatesForActiveMonth(toTime)
            }
            autoApply={true}
            hasCloudCoverage={hasCloudCoverage}
          />
        )}
        <div className="visualization-calendar-holder" ref={(e) => (this.calendarHolder = e)} />
      </>
    );
  }
}
