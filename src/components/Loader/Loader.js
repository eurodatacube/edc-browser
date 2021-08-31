import React from 'react';
import './Loader.scss';
const Loader = ({ type }) => (
  <div className={`loader ${type ? type : ''}`}>
    <span className={`${type ? type : ''}`}>
      <i className="fa fa-spinner fa-spin fa-fw" />
    </span>
  </div>
);

export default Loader;
