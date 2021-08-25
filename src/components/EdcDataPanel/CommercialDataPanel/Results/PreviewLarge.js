import React from 'react';
import Rodal from 'rodal';

import { Button } from '../../../junk/Button/Button';

import './PreviewLarge.scss';

const PreviewLarge = ({ imgUrl, onClose, title }) => {
  if (!imgUrl) {
    return null;
  }
  return (
    <Rodal
      animation="slideUp"
      visible={!!imgUrl}
      customStyles={{
        height: window.innerHeight * 0.75,
        width: window.innerWidth * 0.75,
      }}
      onClose={onClose}
      closeOnEsc={true}
    >
      <div className="preview-large">
        <h3>{title}</h3>
        <div className="image-wrapper">
          <img src={imgUrl} alt={title} />
        </div>
        <Button className="button" onClick={onClose} text={`Close`} />
      </div>
    </Rodal>
  );
};

export default PreviewLarge;
