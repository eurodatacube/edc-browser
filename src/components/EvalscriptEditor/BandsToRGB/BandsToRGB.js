import React from 'react';

import { DraggableBand } from './DraggableBand';
import { DraggableBandGhost } from './DraggableBandGhost';
import { colorUtilRed, colorUtilBlue, colorUtilGreen } from '../../../variables.module.scss';
import './BandsToRGB.scss';
import { SelectedBand } from './SelectedBand';

export const BandsToRGB = ({ bands, selectedBands, onChange }) => {
  if (!bands) {
    return null;
  }

  function createSelectedBandStyle(band) {
    const bandToColor = {
      red: colorUtilRed,
      green: colorUtilGreen,
      blue: colorUtilBlue,
    };

    if (!selectedBands.includes(band)) {
      return {};
    }

    let usedBands = [];

    selectedBands.forEach((selectedBand, index) => {
      if (index === 0 && selectedBand === band) {
        usedBands = ['red'];
      }

      if (index === 1 && selectedBand === band) {
        usedBands = [...usedBands, 'green'];
      }

      if (index === 2 && selectedBand === band) {
        usedBands = [...usedBands, 'blue'];
      }
    });

    let gradientBreakpoints = [100];
    let gradientColors = [];

    if (usedBands.length === 3) {
      gradientBreakpoints = [20, 50, 80];
    }

    if (usedBands.length === 2) {
      gradientBreakpoints = [40, 80];
    }

    usedBands.forEach((band, index) => {
      if (usedBands.length === 1) {
        gradientColors = [`${bandToColor[band]} 0%, ${bandToColor[band]} 100%`];
      } else {
        gradientColors.push(`${bandToColor[band]} ${gradientBreakpoints[index]}%`);
      }
    });

    return {
      color: 'black',
      border: '1px solid black',
      background: `linear-gradient(90deg, ${gradientColors.join(',')})`,
    };
  }

  function getOutputBorder(bandName) {
    const bandNameToColor = {
      r: colorUtilRed,
      g: colorUtilGreen,
      b: colorUtilBlue,
    };

    return bandNameToColor[bandName];
  }

  return (
    <React.Fragment>
      <div className="colors-container">
        {bands.map((band, i) => (
          <DraggableBand key={i} style={createSelectedBandStyle(band)} band={band} onChange={onChange} />
        ))}
        <DraggableBandGhost bands={bands} />
      </div>
      <div className="colors-output rgb-output">
        {['r', 'g', 'b'].map((bandName, i) => (
          <SelectedBand
            bandColor={getOutputBorder(bandName)}
            key={i}
            band={selectedBands[i]}
            bandName={bandName}
            index={i}
            showName
          />
        ))}
      </div>
    </React.Fragment>
  );
};
