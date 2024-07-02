/** @format */

import ChartContext from '@/packages/data/ChartContext';
import ChartOption from '@/packages/data/types/ChartOption';
import AppEventType from '@/packages/events/types/AppEventType';

import Sprite from '@/packages/charts/graphics/Sprite';
import SingleViewChart from '../single-view-chart/SingleViewChart';
import InteractiveChartBase from '../interactive-chart-base/InteractiveChartBase';
import defaultConfig from './defaultConfig';

/**
 * Displays a chart based on the chart context. Automatically switches between single and multiple (overlap) chart views.
 * @class ChartModule
 *
 */
export default class ChartModule extends InteractiveChartBase {
	#chartBody = null;
	#dataAutoLoad = true;

	constructor() {
		super();

		this.mergeConfig(defaultConfig);

		// Update the height of the chart when the context height property changes.
		this.context.subscribe(ChartOption.CHART_HEIGHT, height => {
			this.height = height;
		})

		// Update charts between single and multiple views.
		this.context.subscribe(ChartOption.DATA_FIELD, () => {
			this.#createChartBody();
		})

		this.context.subscribe(ChartOption.CHART_VIEW, () => {
			this.#createChartBody();
		})

		// Display or hide module depending on the context properties.
		this.context.subscribe(ChartOption.VISIBLE, () => {
			this.#updateVisibility();
		});

		// Update the width and height of the chart when this instance is resized.
		this.addEventListener(AppEventType.RESIZE, () => {
			this.#updateChartBody();
		});
		
		this.addEventListener(AppEventType.CHANGE_CONFIG, () => {
			this.#updateChartBody();
		});

	}

	/**
	 * Show or hide momdule depending on the context properties.
	 */
	#updateVisibility() {
		this.visible = this.context.value(ChartOption.VISIBLE);
	}


	#createChartBody() {
		// Proceed if the context is a data context.
		if (this.context instanceof ChartContext) {
			// Remove the chart body if it is not a single view chart.
			if (!(this.#chartBody instanceof SingleViewChart)) {
				this.#removeChartBody();
				this.#chartBody = new SingleViewChart();
				this.addChild(this.#chartBody);
			}

			// Set listeners.
			this.#chartBody.addEventListener(AppEventType.ZOOM, e => this.dispatchEvent(e));
			this.#chartBody.addEventListener(AppEventType.DATA_UPDATED, e => this.dispatchEvent(e));

			this.#chartBody.context.parent = this.context;
			this.#chartBody.dataAutoLoad = this.dataAutoLoad;
		}

		// Otherwise, remove the chart body.
		else {
			this.#removeChartBody();
		}

		this.#updateChartBody();
	}

	#removeChartBody() {
		if (this.#chartBody instanceof Sprite) {
			this.removeChild(this.#chartBody);
			this.#chartBody.destroy();
			this.#chartBody = null;
		}
	}

	#updateChartBody() {
		if (this.#chartBody) {
			this.#chartBody.x = this.config.padding.left ?? 0;
			this.#chartBody.y = this.config.padding.top ?? 0;
			this.#chartBody.width = this.width - (this.config.padding.left ?? 0) - (this.config.padding.right ?? 0);
			this.#chartBody.height = this.height - (this.config.padding.top ?? 0) - (this.config.padding.bottom ?? 0);
		}
	}

	get dataAutoLoad() {
		return this.#dataAutoLoad;
	}

	set dataAutoLoad(value) {
		if (this.#dataAutoLoad !== value) {
			this.#dataAutoLoad = value;
			if (this.#chartBody) {
				this.#chartBody.dataAutoLoad = value;
			}
		}
	}

	get data() {
		return this.#chartBody?.data ?? [];
	}

	destroy() {
		super.destroy();
		this.#removeChartBody();
	}
}