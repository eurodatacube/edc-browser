import React from 'react';
import { useDrag } from 'react-dnd';

export const DraggableBand = ({ band, onChange, style, extraLabelName }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { name: band, type: 'band' },
    type: 'band',
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onChange(item.name, dropResult.id);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      key={band}
      className="band-item"
      title={band}
      style={{ ...style, opacity: isDragging ? 0.4 : 1 }}
    >
      {band}
      {extraLabelName && <div className="draggable-band-extra-label">{extraLabelName}</div>}
    </div>
  );
};
