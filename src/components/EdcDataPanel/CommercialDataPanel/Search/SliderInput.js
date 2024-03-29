import React from 'react';
import { CCSlider } from '../../../CCSlider/CCSlider';

export const SliderInput = ({ input, params, onChangeHandler }) => (
  <div key={`${params.dataProvider}-${input.id}`} className="row">
    <label title={input.label}>{input.label}</label>
    <CCSlider
      sliderWidth={'100%'}
      cloudCoverPercentage={!isNaN(params[input.id]) ? params[input.id] : input.defaultValue}
      onChange={(value) => onChangeHandler(input.id, value)}
      min={input.min}
      max={input.max}
      showIcons={input.showIcons}
      unit={input.unit ? input.unit : null}
    />
  </div>
);
