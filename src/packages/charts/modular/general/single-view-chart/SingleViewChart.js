/** @format */

import defaultConfig from './defaultConfig.js';
import ChartDataLoader from '../chart-data-loader/ChartDataLoader.js';
import AppEvent from '@/packages/events/AppEvent';
import AppEventType from '@/packages/events/types/AppEventType.js';
import ChartOption from '@/packages/data/types/ChartOption';
import chartViews from '@/packages/charts/stores/chartViews';

/**
 * `ChartDataLoader` with functionality to display arbitrary chart view.
 * @see ChartDataLoader
 * @class
 */
export default class SingleViewChart extends ChartDataLoader {
	#viewName;
	#viewInstance;

	constructor() {
		super();
		this.mergeConfig(defaultConfig);

		// Instance of the main view
		this.#viewInstance = null;

		this.#enableEventListeners();

		this.addEventListener(AppEventType.CHANGE_CONFIG, () => {
			this.updateView();
		});
	}

	updateView() {
		if (this.#viewInstance) {
			this.#viewInstance.width = this.width - (this.config?.padding?.left || 0) - (this.config?.padding?.right || 0);
			this.#viewInstance.height = this.height - (this.config?.padding?.top || 0) - (this.config?.padding?.bottom || 0);
			this.#viewInstance.x = this.config?.padding?.left || 0;
			this.#viewInstance.y = this.config?.padding?.top || 0;
		}
	}

	/**
	 * @param {string} value - Name of the view to display data. @see ChartViewType
	 */
	set #view(value) {
		if (this.#viewName === value) {
			return;
		}

		this.removeChild(this.#viewInstance);
		this.#viewInstance?.destroy();
		this.#viewInstance = null;

		if (chartViews[value]) {
			// Create view instance.
			this.#viewInstance = this.addChild(new chartViews[value]());

			// Set context.
			this.#viewInstance.context.parent = this.context;

			// Set data if already available.
			this.#viewInstance.data = this.data;

		} else {
			console.warn(`🔭 View ${value} does not available for ${this.context.value(ChartOption.DATA_FIELD)} data type.`);
		}

		this.#viewName = value;

		this.updateView();
	}

	/**
	 * @return {string} - Name of the currently used view to display data. @see ChartViewType.js
	 */
	get #view() {
		return this.#viewName;
	}


	get viewInstance() {
		return this.#viewInstance;
	}

	/**
	 * Enable event listeners to update existing view instance.
	 */
	#enableEventListeners() {
		this.context.subscribe(ChartOption.CHART_VIEW, value => {
			this.#view = 'GRAPH';
		});

		this.addEventListener(AppEventType.CHANGE_WIDTH, () => {
			if (this.#viewInstance) this.#viewInstance.width = this.width;
		});

		this.addEventListener(AppEventType.CHANGE_HEIGHT, () => {
			if (this.#viewInstance) this.#viewInstance.height = this.height;
		});

		this.addEventListener(AppEventType.DATA_UPDATED, () => {
			if (this.#viewInstance) this.#viewInstance.data = this.data;
		});
	}
}


