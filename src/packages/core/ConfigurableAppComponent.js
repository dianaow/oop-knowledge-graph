/** @format */

import mergeObjects from 'deepmerge';
import EventDispatcher from '../events/EventDispatcher';
import AppEvent from '../events/AppEvent';
import AppEventType from '../events/types/AppEventType';

export default class ConfigurableAppComponent extends EventDispatcher {
	#config;
	#defaultConfig;

	/**
	 * @constructor
	 * AppComponent with config.
	 **/
	constructor() {
		super();

		this.#config = {};

		// Default config to reset to.
		this.#defaultConfig = null;
	}

	/**
	 * Set current config.
	 * @param {Object} value - Current config.
	 */
	set config(value) {
		if (Object.is(this.#config, value)) return;

		if (this.#defaultConfig === null) {
			this.#defaultConfig = value;
		}

		this.#config = value;
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_CONFIG, value));
	}

	get config() {
		return this.#config;
	}

	/**
	 * Default config of this instance.
	 * @prop {object} value - Key/value object.
	 */
	set defaultConfig(value) {
		this.#defaultConfig = value;
	}

	/**
	 * Reset config to default.
	 */
	resetConfig() {
		this.config = this.#defaultConfig || {};
	}

	/**
	 * Update existing config.
	 * @param {Object} value - Config properties to update.
	 */
	mergeConfig(value) {
		this.config = mergeObjects(this.#config, value);
		return this.#config;
	}
}

