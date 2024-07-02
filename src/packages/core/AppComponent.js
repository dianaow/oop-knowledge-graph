/** @format */

import uid from '@/utils/uid';

/**
 * Base for all classes in the app.
 * @class
 */
export default class AppComponent {
	#id;
	#name;
	#destroyed;
	#initiated;

	/**
	 * Base for all classes in the app.
	 * @constructor
	 */
	constructor() {
		this.#id = uid(this.constructor.name);
		this.#destroyed = false;
		this.#name = null;

		// Will be toggled when constructor of this class and its inheritors is complete.
		this.#initiated = false;

		Promise.resolve().then(() => {
			this.#initiated = true;
		});
	}

	/**
	 * @returns {string} - Unique Id.
	 */
	get id() {
		return this.#id;
	}

	/**
	 * Remove event listeners, subscriptions, etc.
	 */
	destroy() {
		if (this.#destroyed) {
			console.warn(`Attempt to destroy already destroyed component ${this.constructor.name}`);
		}

		this.#destroyed = true;
	}

	/**
	 * Whether component is destroyed.
	 */
	get destroyed() {
		return this.#destroyed;
	}

	/**
	 * Get name of the instance.
	 * @return {string} - Arbitrary name of this instance.
	 */
	get name() {
		return this.#name;
	}

	/**
	 * Set arbitrary name of the instance.
	 * @param {string} value - Arbitrary name of this instance.
	 */
	set name(value) {
		if (this.#name === value) {
			return;
		}

		this.#name = value;
	}

	/**
	 * Constructor of this class is executed.
	 * @returns {boolean} - Constructor of this class is executed.
	 */
	get initiated() {
		return this.#initiated;
	}
}

