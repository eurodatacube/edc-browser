import React from 'react';
import './switch.scss';

export default function Switch({ checked, onChange, label }) {
  return (
    <div className="switch">
      <div className={`switch-wrap ${checked ? 'switch-wrap-active' : 'switch-wrap-inactive'}`}>
        <input onChange={onChange} type="checkbox" className="switch-input" />
        <div
          className={`switch-button  ${checked ? 'switch-button-active' : 'switch-button-inactive'}`}
        ></div>
      </div>
      <label className="label-primary switch-label" htmlFor="">
        {label}
      </label>
    </div>
  );
}
