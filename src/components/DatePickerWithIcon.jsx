import React, {forwardRef} from 'react';

const DatePickerWithIcon = forwardRef(({value, onClick}, ref) => (
    <div className="datepicker-input-wrapper" onClick={onClick}>
        <input
            readOnly
            ref={ref}
            value={value}
            className="datepicker-custom-input"
            placeholder="Выберите дату и время"
        />
        <span className="calendar-icon">
<svg width="20.000000" height="20.000000" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
	<defs/>
	<path id="矢量 41"
          d="M15 2L19 2C19.26 2 19.51 2.1 19.7 2.29C19.89 2.48 20 2.73 20 3L20 19C20 19.26 19.89 19.51 19.7 19.7C19.51 19.89 19.26 20 19 20L1 20C0.73 20 0.48 19.89 0.29 19.7C0.1 19.51 0 19.26 0 19L0 3C0 2.73 0.1 2.48 0.29 2.29C0.48 2.1 0.73 2 1 2L5 2L5 0L7 0L7 2L13 2L13 0L15 0L15 2ZM13 4L7 4L7 6L5 6L5 4L2 4L2 8L18 8L18 4L15 4L15 6L13 6L13 4ZM18 10L2 10L2 18L18 18L18 10Z"
          fill="#353535" fillOpacity="1.000000" fillRule="evenodd"/>
</svg>
    </span>
    </div>
));

export default DatePickerWithIcon;
