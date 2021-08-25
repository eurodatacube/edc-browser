export function generateConfigurationsFromBands(bands, max_n = 10) {
  const configurations = [];
  const bandNames = Object.keys(bands);
  const n = Math.min(bandNames.length, max_n);

  for (let i = 0; i < n; i++) {
    configurations.push({
      layer_name: bandNames[i],
      evalscript: generateV3Evalscript([bandNames[i]], bands[bandNames[0]].bitDepth),
    });
  }
  return configurations;
}

export function generateV3Evalscript(bands, bitDepth = 8) {
  return `//VERSION=3
function setup() {
  return {
    input: [${bands.map((b) => `"${b}"`).join(',')}],
    output: { bands: ${bands.length}, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  const factor = ${1 / Math.pow(2, bitDepth)}
  const visualizer = new HighlightCompressVisualizer(0, 0.01)
  return [${bands.map((b) => `visualizer.process(factor*sample.${b})`).join(',')}];}`;
}
