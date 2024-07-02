/** @format */

import ChartSprite from './ChartSprite';

import colorScales from '@/packages/charts/graphics/colorScales';

import AppEvent from '@/packages/events/AppEvent';
import AppEventType from '@/packages/events/types/AppEventType';

import throttler, { stopThrottler } from '@/utils/throttler';
import debouncer from '@/utils/debouncer';

/**
 * Represents visual part of chart.
 * Contains everything required to draw chart.
 * @class
 */
export default class ChartView extends ChartSprite {
	#data;
	#options;
	#throttleChanges;
	#throttleRedraw;
	#throttleDataChanges;
	#colorScale;
	#colorScaleType;
	#colorScaleName;

	constructor() {
		super();

		// Data to use in redraw method.
		// Typically latest called data.
		this.#data = [];

		// Init color scale.
		this.#colorScale = colorScales['DEFAULT'];

		// Throttler to aggregate all changes.
		this.#throttleChanges = throttler(this.changed.bind(this));

		// Throttler to aggregate data options changes.
		this.#throttleDataChanges = throttler(this.changedDataTerms.bind(this));

		this.#throttleRedraw = throttler(this.#callRedraw.bind(this));
		const debounceRedraw = debouncer(this.#callRedraw.bind(this), 100, 1000);

		// Init color scale type.
		this.#colorScaleType = 'RELATIVE';

		// Init color scale name.
		this.#colorScaleName = 'DEFAULT';

		this.addEventListener(AppEventType.RESIZE, () => {
			debounceRedraw();
			this.#throttleChanges();
		});

		this.addEventListener(AppEventType.CHANGE_DATA_TERMS, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.DATA_UPDATED, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.CHANGE_COLOR_SCALE, () => {
			this.#throttleRedraw();
		});
	}

	// Dispatch request to redraw chart.
	#callRedraw() {
		this.#data && this.dispatchEvent(new AppEvent(AppEventType.REDRAW_CHART));
	}

	changeRequest(type) {
		this.#throttleChanges(type);
	}

	changed(e) {
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COMPLETE, e));
	}

	changedDataTerms(e) {
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COMPLETE_DATA_TERMS, e));
	}

	/**
	 * Destroy component.
	 * Call it if you don't need this anymore.
	 */
	destroy() {
		super.destroy();
		stopThrottler(this.#throttleChanges);
		stopThrottler(this.#throttleDataChanges);
		stopThrottler(this.#throttleRedraw);
	}

	/**
	 * @param {string} value - Color scale from ColorScaleType class.
	 */
	set colorScaleType(value) {
		if (value === this.#colorScaleType) {
			return;
		}

		this.#colorScaleType = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE_TYPE, value));
	}

	/**
	 * @return {string} - Color scale from ColorScaleType class.
	 */
	get colorScaleType() {
		return this.#colorScaleType;
	}

	/**
	 * @param {string} value - Color scale name from ColorScaleReference class.
	 */
	set colorScaleName(value) {
		if (value === this.#colorScaleName) {
			return;
		}

		this.#colorScaleName = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE_NAME, value));
	}

	/**
	 * @return {string} - Color scale from ColorScaleType class.
	 */
	get colorScaleName() {
		return this.#colorScaleName;
	}

	set options(value) {
		this.#options = value;
		this.#throttleChanges(AppEventType.CHANGE_OPTIONS);
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_OPTIONS));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_DATA_TERMS, value));
	}

	get options() {
		return this.#options;
	}

	/**
	 * Set color-scale function.
	 * @param {function} type - Funtion that returns color takes index and min-max values as arguments.
	 */
	set colorScale(func) {
		if (this.#colorScale === func) {
			return;
		}

		this.#colorScale = func;
		this.#throttleChanges(AppEventType.CHANGE_OPTIONS);
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE, func));
	}

	/**
	 * Return type of the chart color scale.
	 * @return {function} - Funtion that returns color takes index and max value as arguments.
	 */
	get colorScale() {
		return this.#colorScale;
	}

	/**
	 * @returns {Array} - Promise with requested data
	 */
	get data() {
		return this.#data;
	}

	set data(value) {
		if (value === this.#data) return;
		this.#data = value;
		this.#throttleChanges(AppEventType.DATA_UPDATED);
		this.dispatchEvent(new AppEvent(AppEventType.DATA_UPDATED, value));
	}

}