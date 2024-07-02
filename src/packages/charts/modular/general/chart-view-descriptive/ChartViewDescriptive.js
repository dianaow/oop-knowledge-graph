/** @format */

import defaultConfig from './defaultConfig';

import ChartView from '../ChartView';
import Sprite from '@/packages/charts/graphics/Sprite';

import AppEvent from '@/packages/events/AppEvent.js';
import AppEventType from '@/packages/events/types/AppEventType.js';

/**
 * @class
 * @see ChartView
 */
export default class ChartViewDescriptive extends ChartView {
	#chart;
	#legendView;
	
	constructor() {
		super();

		this.mergeConfig(defaultConfig);

		// Chart container.
		this.#chart = this.addChild(new Sprite());

		// Listening resize event to arrange chart and legend.
		this.addEventListener(AppEventType.RESIZE, () => {
			this.arrange();
		});

		this.addEventListener(AppEventType.CHANGE_CONFIG, () => {
			this.arrange();
		});

		this.arrange();
	}

	// Arrange chart and legend on plot.
	arrange() {
		this.#chart.x = this.config.padding.left;
		this.#chart.y = this.config.padding.top;
		this.#chart.width = this.width - this.config.padding.left - this.config.padding.right;
		this.#chart.height = this.height - (this.#legendView && this.legendVisible ? this.#legendView.height : 0) - this.config.padding.bottom - this.config.padding.top;

		this.dispatchEvent(new AppEvent(AppEventType.REDRAW_CHART));
	}

	get chart() {
		return this.#chart;
	}

	destroy() {
		super.destroy();
	}
}


