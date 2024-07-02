/** @format */

import * as d3 from 'd3';

export default Object.freeze({
	linkStyles: {
		// stroke : '#ffffff', // link stroke color (only applied if specified, if not it will follow the source node color)
		strokeOpacity: 1, // link stroke opacity
		strokeWidth: 2, // given d in links, returns a stroke width in pixels
		type: "arc", // arc/line
	},
	nodeStyles: {
		// fill: '#000000', // node color (only applied if specified)
		// stroke : '#000000', // node stroke color (only applied if specified)
		strokeWidth: 1, // node stroke width, in pixels
		fillOpacity: 0.8, // node stroke opacity
		strokeOpacity: 1, // node stroke opacity
		type: "standard", // gradient/standard/filled
	},
	labelStyles: {
		fontWeight: "normal",
		visibility: "hidden",
		color: "#000",
		label: "",
		edge: {
			visibility: "hidden",
			opacity: 0.4,
			"font-size": "6px",
			label: "",
		},
	}
});
