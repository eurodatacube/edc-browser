import React, { useRef } from 'react';
import DatePicker from '../../../DateSelectionComponents/DatePicker/DatePicker';
const DateInput = ({ value, label, onChangeHandler, min, max, name }) => {
  const calendarHolderRef = useRef();

  return (
    <>
      <div className="row">
        <label title={label}>{label}</label>
        <DatePicker
          id={`${name}-calendar-holder`}
          selectedDay={value}
          calendarContainer={calendarHolderRef}
          setSelectedDay={(selectedDate) => onChangeHandler(name, selectedDate)}
          minDate={min}
          maxDate={max}
        />
      </div>
      <div
        id={`${name}-calendar-holder`}
        className={`${name}-calendar-holder`}
        ref={(el) => (calendarHolderRef.current = el)}
      />
    </>
  );
};

export default DateInput;
