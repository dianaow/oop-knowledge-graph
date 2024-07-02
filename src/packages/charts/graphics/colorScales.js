import * as d3 from 'd3';

const colorScheme = [
  {
    color: "#418BFC",
    value: 'Country',
  },
  {
    color: "#46BCCB",
    value: 'Region',
  },
  {
    color: "#46BCC8",
    value: 'Industry',
  },
  {
    color: "#EA6BCB",
    value: 'Sector',
  },
  {
    color: "#B9AACB",
    value: 'Company',
  },
  {
    color: "#B6BE1C",
    value: 'FX',
  },
  {
    color: "#F64D1A",
    value: 'Equity',
  }
]

// Use ordinal scale if values are strings instead of numbers.
const scale = colorScheme.every(v => typeof v.value === 'string') ? d3.scaleOrdinal() : d3.scaleLinear().clamp(true);

const colorScale = scale.range(colorScheme.map(v => v.color)).domain(colorScheme.map(v => v.value));

const allColorScales = Object.freeze({
	['DEFAULT']: colorScale,
});

export default allColorScales;