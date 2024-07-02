/** @format */

export default {
	padding: {
		left: 0,
		right: 0,
	},
	views: {
		icon: {
			width: 55, // Max width of icon
			height: 38, // Max height of icon
			gap: 8, // Gap between thumbs and outer borders
		},
		toggle: {
			// Button to show/hide views
			width: 20,
			height: 10,
			stroke: 'rgba(160, 160, 160, 1)', // Color of the icon
			strokeWidth: 2, // Icon thickness
		},
	},
	axis: {
		y: {
			minSizeToDisplay: [30, 30],
			opacity: 0.7,
		},
	},
};
