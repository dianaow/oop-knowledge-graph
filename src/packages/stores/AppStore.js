/** @format */

import AppEvent from '../events/AppEvent';
import EventDispatcher from '../events/EventDispatcher';
import AppStoreEventType from '../events/types/AppStoreEventType';

/**
 * Interchangeable store with Svelte stores.
 */
export default class AppStore extends EventDispatcher {
	#value;
	#requestedValue;
	#pause;

	constructor(value) {
		super();
		this.#value = null;
		this.#requestedValue = null;
		this.#pause = false;
		this.value = value;
	}

	/**
	 * Subscribe to changes with callback function.
	 * @param {function} callback - Call this function on every change.
	 * @returns {function} - Function whose call will unsubscribe registered callback.
	 */
	subscribe(callback) {
		callback?.(this.#value, this.#value);
		return this.addEventListener(AppStoreEventType.CHANGE, ({ data, oldData, target }) => callback(data, oldData, target));
	}

	/**
	 * Alias for value setter.
	 * @param {*} value - Value to set.
	 */
	set(value) {
		this.#setValue(value);
	}

	/**
	 * Set current value.
	 * @param {*} value - Value to set.
	 */
	set value(value) {
		this.#setValue(value);
	}

	#setValue(value) {
		this.#requestedValue = value;

		if (Object.is(value, this.#value) || this.#pause) {
			return;
		}

		this.#value = value;
		this.dispatchEvent(new AppEvent(AppStoreEventType.CHANGE, value));
	}

	/**
	 * @returns {*} - Current value.
	 */
	get value() {
		return this.#value;
	}

	/**
	 * Requested value which can be different when instance is on pause.
	 * @return {*} - Requested value.
	 */
	get requestedValue() {
		return this.#requestedValue;
	}

	/**
	 * Set value taking return from given function.
	 * @param {*} fn - Function that returns value to set.
	 */
	update(fn) {
		this.value = fn(this.#value);
		return this;
	}

	/**
	 * Prevent changes for a while.
	 * @param {boolean} value - True to stop mutations, false to turn it on and apply last requested change.
	 */
	set pause(value) {
		if (this.#pause === value) {
			return;
		}

		this.#pause = value;
		this.silent = value;

		if (value === false) {
			this.#setValue(this.#requestedValue);
		}
	}
}

