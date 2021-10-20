import React from 'react';
import { useDrop } from 'react-dnd';

export const SelectedBand = ({ band, bandName, index, showName, labelName, bandColor }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'band',
    drop: () => ({
      id: index,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className="selected-band-wrap" key={bandName}>
      {showName && <label className="label-primary selected-band-label">{bandName.toUpperCase()}:</label>}
      <div
        className={`col-holder${canDrop ? ' can-drop' : ''}${canDrop && isOver ? ' is-active' : ''}`}
        id={bandName}
        name={bandName}
        ref={drop}
      >
        <div
          style={{ border: `2px solid ${bandColor}` }}
          className="selected-band"
          title={(band && band.description) || 'Drag band'}
        >
          {band || bandName.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
