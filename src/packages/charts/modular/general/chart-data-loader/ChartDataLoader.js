/** @format */

import * as d3 from 'd3';
import defaultConfig from './defaultConfig';

import ChartSprite from '@/packages/charts/modular/general/ChartSprite';

import ChartOption from '@/packages/data/types/ChartOption';
import DataType from '@/packages/data/types/DataType';

import AppEvent from '@/packages/events/AppEvent';
import AppEventType from '@/packages/events/types/AppEventType';
import ContextEventType from '@/packages/events/types/ContextEventType';

import dataStore from '@/packages/data/stores/data';

import debouncer, { stopDebouncer } from '@/utils/debouncer';

/**
 * Load chart data automatically.
 * @see ChartViewContextual
 * @class
 */
export default class ChartDataLoader extends ChartSprite {
	#dataAutoLoad;
	#dataTermsUnsubscribe;
	#infoEl;
	#loadings;
	#loadingCounter;
	#loadingTimeoutId;
	#spinnerG;
	#spinnerTrack;
	#spinnerPointer;
	#debounceDataLoad;
	#rawData;
	#data;

	constructor() {
		super();

		this.mergeConfig(defaultConfig);

		this.#dataAutoLoad = true;

		// Active loaders.
		this.#loadings = 0;

		// Total loading progress.
		this.#loadingCounter = 0;

		// Loaded data before mapping.
		this.#rawData = [];

		// Loaded and handled data.
		this.#data = [];

		// Debouncer to accumulate event before start data loading.
		this.#debounceDataLoad = debouncer(this.#loadData.bind(this), 400, 1200);

		// Loading spinner.
		this.#spinnerG = this.ui.append('g').attr('class', 'spinner-g').attr('opacity', 0);

		this.#spinnerTrack = this.#spinnerG.append('rect').attr('width', '100%');

		this.#spinnerPointer = this.#spinnerG.append('rect').attr('class', 'text-primary').attr('width', '50%');

		// Text node on the center of the module to display custom text.
		this.#infoEl = this.ui
			.append('text')
			.attr('class', 'chart-info text-secondary')
			.attr('x', '50%')
			.attr('y', '50%')
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.style('pointer-events', 'none');

		// Reload data after visibility is toggled on and `dataAutoLoad` flag is enabled.
		this.context.subscribe(ChartOption.VISIBLE, value => {
			this.#dataTermsUnsubscribe && this.#dataTermsUnsubscribe();
			this.#dataTermsUnsubscribe = null;

			if (value) {
				this.dataAutoLoad = this.#dataAutoLoad;
			}
		});

		this.addEventListener(AppEventType.CHANGE_CONFIG, () => {
			this.#refresh();
		});

		// Disable context menu with control key to keep drag with mouse ability.
		this.root.on('contextmenu', e => {
			if (e.ctrlKey) {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		this.#refresh();
	}

	#refresh() {
		this.#infoEl.attr('font-size', `${this.config.info.fontSize}px`).attr('fill', this.config.info.fill).attr('opacity', 0);

		this.#spinnerTrack.attr('fill', this.config.spinner.track.fill).attr('height', this.config.spinner.height);

		this.#spinnerPointer.attr('fill', this.config.spinner.pointer.fill).attr('height', this.config.spinner.height);
	}

	set dataAutoLoad(value) {
		if (value === Boolean(this.#dataTermsUnsubscribe)) {
			return;
		}

		this.#dataTermsUnsubscribe?.();

		if (value && this.context.value(ChartOption.VISIBLE)) {
			this.#debounceDataLoad(this.context.value(ChartOption.DATA_FIELD));
			this.#dataTermsUnsubscribe = this.context.addEventListener(ContextEventType.CHANGE_DATA_TERMS, () => {
				this.#debounceDataLoad(this.context.value(ChartOption.DATA_FIELD));
			});
		} else {
			this.#dataTermsUnsubscribe = null;
		}

		this.#dataAutoLoad = value;
	}

	get dataAutoLoad() {
		return this.#dataAutoLoad;
	}

	async #loadData() {
		this.loadings++;
		this.#rawData = await dataStore.get(this.context.value(ChartOption.DATA_FIELD), this.context.chartOptions);
		this.data = this.#rawData;
		
		this.loadings--;
	}

	get loading() {
		return Boolean(this.#loadings);
	}

	/**
	 * Set the number of current loadings.
	 * @param {number} value
	 */
	set loadings(value) {
		if (value === this.#loadings) {
			return;
		}

		clearTimeout(this.#loadingTimeoutId);

		if (value) {
			this.#spinnerG.transition().attr('opacity', 1);
			this.#spinnerPointer.attr('width', 0);
			this.#loadingTick();
		} else {
			this.#spinnerG.transition().attr('opacity', 0);
			this.#spinnerPointer.transition().attr('width', '100%');
		}
		
		// Display message if no data exist for current time range.
		this.#infoEl
			.attr('visibility', this.data?.length === 0 ? 'hidden' : 'visible')
			//.datum(this.data?.length || value || this.context.value(ChartOption.DATA_FIELD) === DataType.NONE)
			.text(this.config.info.noDataTextTemplate.replace('{dataType}', this.context.value(ChartOption.DATA_FIELD)))
			// .transition()
			// .attr('opacity', d => (d ? 0 : 1))
			// .on('end', function () {
			// 	d3.select(this).attr('visibility', d => (d ? 'hidden' : 'visible'));
			// });

		this.#loadings = value;
	}

	/**
	 * Return number of registered data loadings.
	 * @returns {number}
	 */
	get loadings() {
		return this.#loadings;
	}

	#loadingTick() {
		this.#loadingCounter += Math.random() < 0.1 ? 0.3 : 0.03;

		this.#spinnerPointer.transition().attr('width', `${Math.atan(Math.atan(this.#loadingCounter)) * 100}%`);

		this.#loadingTimeoutId = setTimeout(() => {
			this.#loadingTick();
		}, 100);
	}

	destroy() {
		super.destroy();
		stopDebouncer(this.#debounceDataLoad);
	}

	/**
	 * @returns {Array} - Loaded data.
	 */
	get data() {
		return this.#data;
	}

	set data(value) {
		if (value === this.#data) {
			return;
		}

		this.#data = value;

		this.dispatchEvent(new AppEvent(AppEventType.DATA_UPDATED, value));
	}
}