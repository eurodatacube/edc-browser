import axios from 'axios';

export function generateConfigurationsFromBands(bands, max_n = 10) {
  const configurations = [];
  const bandNames = Object.keys(bands);
  const n = Math.min(bandNames.length, max_n);

  for (let i = 0; i < n; i++) {
    configurations.push({
      layer_name: bandNames[i],
      evalscript: generateBYOCConfigurationEvalscript([bandNames[i]], bands[bandNames[0]].bitDepth),
    });
  }
  return configurations;
}

export function generateBYOCConfigurationEvalscript(bands, bitDepth = 8) {
  const inputBands = Array.from(new Set(bands));
  return `//VERSION=3
function setup() {
  return {
    input: [${inputBands.map((b) => `"${b}"`).join(',')}],
    output: { bands: ${bands.length}, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  const factor = ${1 / Math.pow(2, bitDepth)}
  const visualizer = new HighlightCompressVisualizer(0, 0.01)
  return [${bands.map((b) => `visualizer.process(factor*sample.${b})`).join(',')}];}`;
}

export function generateReflectanceCompositeEvalscript(bands) {
  const inputBands = Array.from(new Set(bands));
  return `//VERSION=3
function setup() {
  return {
    input: [${inputBands.map((b) => `"${b}"`).join(',')}],
    output: { bands: ${bands.length}, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  return [${bands.map((b) => `2.5*sample.${b}`).join(',')}];}`;
}

export async function fetchEvalscriptFromEvalscripturl(evalscripturl) {
  return axios.get(evalscripturl);
}

export function parseBandsFromEvalscript(evalscript) {
  try {
    return evalscript
      .split('\n')[9]
      .split('[')[1]
      .split(']')[0]
      .split(',')
      .map((b) => b.replace('2.5*sample.', '').replace(')', '').trim());
  } catch (err) {
    return null;
  }
}

export function generateIndexEvalscript(bands, config) {
  // custom config formula used in index feature
  if (config) {
    const { equation, colorRamp, values } = config;
    const indexEquation = [...equation]
      .map((item) => (item === 'B' && `samples.${bands.b}`) || (item === 'A' && `samples.${bands.a}`) || item)
      .join('');
    // temp fix with index instead of actual positions, to be removed in next commit
    return `//VERSION=3
const colorRamp = [${colorRamp.map((color, index) => `[${values[index]},${color.replace('#', '0x')}]`)}]

let viz = new ColorRampVisualizer(colorRamp);

function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: [
      { id:"default", bands: 4 },
      { id: "index", bands: 1, sampleType: 'FLOAT32' }
    ]
  };
}

function evaluatePixel(samples) {
  let index = ${indexEquation};
  const minIndex = ${values[0]};
  const maxIndex = ${values[values.length - 1]};
  let visVal = null;

  if(index > maxIndex || index < minIndex) {
    visVal = [0, 0, 0, 0];
  }
  else {
    visVal = [...viz.process(index),samples.dataMask];
  }

  // The library for tiffs works well only if there is only one channel returned.
  // So we encode the "no data" as NaN here and ignore NaNs on frontend.
  const indexVal = samples.dataMask === 1 ? index : NaN;

  return { default: visVal, index: [indexVal] };
}`;
  }
}

export function parseIndexEvalscript(evalscript) {
  try {
    if (evalscript.startsWith('//VERSION=3')) {
      let equation = '';
      let bands = evalscript
        .split('\n')[16]
        .split('=')[1]
        .split('/')
        .map((item) => item.replace('(', '').replace(')', '').replace(' ', ''));

      if (bands[0].indexOf('-') !== -1) {
        equation = '(A-B)/(A+B)';
        bands = bands[0].split('-').map((item) => item.replace('samples.', ''));
      } else {
        equation = '(A/B)';
        bands = bands.map((item) => item.replace('samples.', ''));
      }

      bands = { a: bands[0], b: bands[1] };

      // positions and coresponding color
      let values = evalscript
        .split('\n')[1]
        .split('=')[1]
        .split(',')
        .map((item) => item.replace(/\[/g, '').replace(/]/g, '').replace(' ', ''));

      let colors = values.filter((item) => item.indexOf('0x') !== -1).map((item) => item.replace('0x', '#'));
      let positions = values.filter((item) => item.indexOf('0x') === -1).map((item) => parseFloat(item));

      return {
        bands: bands,
        equation: equation,
        positions: positions,
        colors: colors,
      };
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}
