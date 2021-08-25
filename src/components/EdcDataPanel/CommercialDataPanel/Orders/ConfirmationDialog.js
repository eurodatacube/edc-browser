import React from 'react';
import Rodal from 'rodal';

import { Button } from '../../../junk/Button/Button';

import './ConfirmationDialog.scss';

export const ConfirmationDialog = (confirmAction, setConfirmAction) => {
  return (
    <Rodal
      animation="slideUp"
      visible={true}
      width={500}
      height={200}
      onClose={() => setConfirmAction(false)}
      closeOnEsc={true}
    >
      <div className="confirm-action-dialog">
        <b>{confirmAction.title}</b>
        <div className="content">
          {confirmAction.message.split('\n').map((messageLine, index) => (
            <div key={index}>{messageLine}</div>
          ))}
        </div>
        <div className="buttons">
          <Button text={`OK`} onClick={confirmAction.action}></Button>
          {!!confirmAction.showCancel && (
            <Button text={`Cancel`} onClick={() => setConfirmAction(false)}></Button>
          )}
        </div>
      </div>
    </Rodal>
  );
};
