import React from 'react';
import ReactDOM from 'react-dom';
import onClickOutside from 'react-onclickoutside';
import DayPicker from 'react-day-picker';

import { getFirstDayOfWeek, getWeekDaysLong, getWeekDaysMin, getMonths } from './MomentLocaleUtils';
import { momentToDate } from './Datepicker.utils';
import Navbar from './Navbar';
import YearMonthForm from './YearMonthForm';
import { CCSlider } from '../../CCSlider/CCSlider';

import 'react-day-picker/lib/style.css';
import './Calendar.scss';

function Calendar(props) {
  const {
    selectedDay,
    minDate,
    maxDate,
    locale,
    calendarContainer,
    handleMonthChange,
    handleDayClick,
    onMonthOrYearDropdownChange,
    highlightedDays,
    maxCloudCover,
    setMaxCloudCover,
    hasCloudCoverFilter,
  } = props;

  const modifiers = {
    highlighted: highlightedDays,
  };

  return ReactDOM.createPortal(
    <div className="calendar-wrapper">
      <DayPicker
        showOutsideDays
        selectedDays={momentToDate(selectedDay)}
        modifiers={modifiers}
        month={momentToDate(selectedDay)}
        onMonthChange={handleMonthChange}
        onDayClick={handleDayClick}
        disabledDays={[
          {
            after: momentToDate(maxDate),
            before: momentToDate(minDate),
          },
        ]}
        navbarElement={<Navbar minDate={minDate} maxDate={maxDate} selectedDate={selectedDay} />}
        captionElement={({ locale }) => (
          <YearMonthForm
            minFromDate={minDate}
            maxToDate={maxDate}
            onChange={onMonthOrYearDropdownChange}
            locale={locale}
            selectedDay={selectedDay}
          />
        )}
        locale={locale}
        weekdaysLong={getWeekDaysLong(locale)}
        weekdaysShort={getWeekDaysMin(locale)}
        months={getMonths(locale)}
        firstDayOfWeek={getFirstDayOfWeek(locale)}
      />
      {hasCloudCoverFilter && (
        <div className="cc-wrapper">
          <div className="cc-text-label">Max. cloud coverage:</div>
          <CCSlider
            showIcons={false}
            sliderWidth={'100%'}
            onChange={(value) => setMaxCloudCover(value)}
            cloudCoverPercentage={maxCloudCover}
            showSliderTooltip={true}
          />
        </div>
      )}
    </div>,
    calendarContainer.current ? calendarContainer.current : calendarContainer,
  );
}

export default onClickOutside(Calendar);
