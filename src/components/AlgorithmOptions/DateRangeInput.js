import React, { useRef } from 'react';
import moment from 'moment';

import DatePicker from '../DateSelectionComponents/DatePicker/DatePicker';
import { momentToISODate } from '../../utils';
import { DEFAULT_FROM_TIME } from '../../const';

export default function DateRangeInput(props) {
  const calendarHolder = useRef(null);
  const { restriction, value, setValue, showingError, isValid, isOptional, renderError } = props;

  function setTimeFrom(date) {
    setValue(`${momentToISODate(date)}/${momentToISODate(toMoment)}`, isDateRangeValid(date, toMoment));
  }

  function setTimeTo(date) {
    setValue(`${momentToISODate(fromMoment)}/${momentToISODate(date)}`, isDateRangeValid(fromMoment, date));
  }

  function isDateRangeValid(from, to) {
    return from.isValid() && to.isValid() && from.isBefore(to);
  }

  const [fromTime, toTime] = value.split('/');
  const fromMoment = moment.utc(fromTime);
  const toMoment = moment.utc(toTime);

  return (
    <div className="algorithm-option-daterange">
      <div className="select-time-range">
        <div className="date-pickers-wrapper">
          <DatePicker
            id="from-search-datepicker"
            selectedDay={fromMoment}
            setSelectedDay={setTimeFrom}
            calendarContainer={calendarHolder}
            minDate={DEFAULT_FROM_TIME}
            maxDate={toMoment}
          />

          <span className="date-picker-separator">-</span>
          <DatePicker
            id="to-search-datepicker"
            selectedDay={toMoment}
            setSelectedDay={setTimeTo}
            calendarContainer={calendarHolder.current}
            minDate={fromMoment}
            maxDate={moment.utc()}
          />
          <div className="calendar-holder-algorithm" ref={calendarHolder} />
        </div>
      </div>
      {restriction && restriction.length > 0 && (
        <div className="algorithm-option-string-restriction">Supported values: {restriction.join(', ')}.</div>
      )}
      {showingError &&
        renderError(value, isValid, isOptional, 'Date has to be selected.', 'Date is not picked correctly.')}
    </div>
  );
}
