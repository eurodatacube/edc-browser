import React from 'react';
import DatePicker from '../../../DateSelectionComponents/DatePicker/DatePicker';

const DateInput = ({ name, value, label, onChangeHandler, min, max, calendarContainerRef }) => {
  return (
    <>
      <div className="row">
        <label title={label}>{label}</label>
        <DatePicker
          id={`${name}-calendar-holder`}
          selectedDay={value}
          calendarContainer={
            calendarContainerRef && calendarContainerRef.current ? calendarContainerRef.current : null
          }
          setSelectedDay={(selectedDate) => onChangeHandler(name, selectedDate)}
          minDate={min}
          maxDate={max}
        />
      </div>
      <div id={`${name}-calendar-holder`} className={`${name}-calendar-holder`} ref={calendarContainerRef} />
    </>
  );
};

export default DateInput;
