import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import store, { errorsSlice } from '../../store';

import './ErrorPanel.scss';

const CLEAR_ERRORS_TIMEOUT = 15000;

function ErrorPanel({ errors }) {
  const [clearErrorsTimeoutId, setClearErrorsTimeoutId] = useState(null);

  useEffect(() => {
    if (errors.length) {
      clearTimeout(clearErrorsTimeoutId);
      const timeoutId = setTimeout(() => store.dispatch(errorsSlice.actions.reset()), CLEAR_ERRORS_TIMEOUT);
      setClearErrorsTimeoutId(timeoutId);
    }
    // eslint-disable-next-line
  }, [errors]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="visualization-error-panel">
      <div className="visualization-error-header">
        <i className="fa fa-exclamation-circle" />
        Errors have occurred while fetching data:
      </div>
      <div className="textarea-wrapper">
        <pre className="error-container">{errors.map((error) => error.text).join('\n\n')}</pre>
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  errors: store.errors.errors,
});

export default connect(mapStoreToProps, null)(ErrorPanel);
