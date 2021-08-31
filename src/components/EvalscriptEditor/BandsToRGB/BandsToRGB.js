import React from 'react';

import { DraggableBand } from './DraggableBand';
import { DraggableBandGhost } from './DraggableBandGhost';

import './BandsToRGB.scss';
import { SelectedBand } from './SelectedBand';

export const BandsToRGB = ({ bands, selectedBands, onChange }) => {
  if (!bands) {
    return null;
  }

  return (
    <React.Fragment>
      <p>Drag bands onto RGB fields.</p>
      <div className="colors-container">
        {bands.map((band, i) => (
          <DraggableBand key={i} band={band} onChange={onChange} />
        ))}
        <DraggableBandGhost bands={bands} />
      </div>
      <div className="colors-output">
        {['r', 'g', 'b'].map((bandName, i) => (
          <SelectedBand key={i} band={selectedBands[i]} bandName={bandName} index={i} showName />
        ))}
      </div>
    </React.Fragment>
  );
};
