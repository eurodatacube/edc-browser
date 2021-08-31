import React from 'react';
import { useDrop } from 'react-dnd';

export const SelectedBand = ({ band, bandName, index, showName }) => {
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
    <React.Fragment key={bandName}>
      {showName && <b>{bandName.toUpperCase()}:</b>}
      <div
        className={`col-holder${canDrop ? ' can-drop' : ''}${canDrop && isOver ? ' is-active' : ''}`}
        id={bandName}
        name={bandName}
        ref={drop}
      >
        <div
          className="selected-band"
          style={{
            backgroundColor: (band && band.color) || '#22232d',
          }}
          title={(band && band.description) || 'Drag band'}
        >
          {band || bandName.toUpperCase()}
        </div>
      </div>
    </React.Fragment>
  );
};
