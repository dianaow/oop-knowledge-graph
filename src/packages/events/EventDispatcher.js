/** @format */

import AppComponent from '../core/AppComponent';
import AppEvent from './AppEvent';
import AppEventType from './types/AppEventType';

/**
 * Base component that dispatch and receive event notifications.
 * @class
 * @see AppComponent
 */
class EventDispatcher extends AppComponent {
	// Registered listeners.
	#listeners;

	// Flag to disable events.
	#silent;

	// Set to store event that were triggered during silent state.
	#silentEvents;

	// Store events to attach previous value along with the new one.
	#oldEvents = {};

	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.#listeners = {};

		// When true, events do not dispatch.
		this.#silent = false;

		this.#silentEvents = [];
	}

	/**
	 * Execute registered callbacks for given event type.
	 * @param {AppEvent} event - Event to dispatch.
	 * @param {boolean} force - Ignore silence flag.
	 * @returns
	 */
	dispatchEvent(event, force) {
		if (this.destroyed) {
			console.warn('🗣️ Trying to dispatch events from destroyed dispatcher.', event.type);
		}

		if (!force && this.#silent) {
			this.#silentEvents.push(event);
			return;
		}

		// Set the target and oldValue only if target is not set, otherwise it means that event was originally dispatched from another dispatcher and then forwarded.
		if (!event.target) {
			event.target = this;
			event.oldData = this.#oldEvents[event.type]?.data;
			this.#oldEvents[event.type] = event;
		} else {
			event._bubbled = true;
		}

		// Run callbacks for specific subscribers.
		this.#listeners?.[event.type]?.forEach(callback => callback(event));

		// Run callbacks for general subscribers.
		this.#listeners?.['*']?.forEach(callback => callback(event));
	}

	/**
	 * Register event listener.
	 * @prop {string} type - Event type.
	 * @prop {function} callback - Callback to call when registered event type fires.
	 * @returns {function} - Function whose call will unsubscribe registered callback from registered event type.
	 */
	addEventListener(type, callback) {
		const callbacks = this.#listeners[type] || [];

		if (callbacks.indexOf(callback) === -1) {
			callbacks.push(callback);
			this.#listeners[type] = callbacks;
		}

		// Return function to unsubscribe.
		return function () {
			this.target.removeEventListener(this.type, this.callback);
		}.bind({ type, callback, target: this });
	}

	/**
	 * Enable or disable events dispatch.
	 * @param {boolean}
	 */
	set silent(value) {
		if (value === this.#silent) return;

		this.#silent = value;

		// Dispatch change event and pass events that were triggrered during silent mode.
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_SILENCE, value ? null : this.#silentEvents), true);

		this.#silentEvents = [];
	}

	get silent() {
		return this.#silent;
	}

	removeEventListener(type, callback) {
		if (this.#listeners[type]) {
			const index = this.#listeners[type].indexOf(callback);
			if (index >= 0) {
				this.#listeners[type].splice(index, 1);
			}
		}
	}

	destroy() {
		super.destroy();
		this.#listeners = {};
	}

	setPropertySilent(name, value) {
		// Temporary disable events.
		const oldSilent = this.#silent;
		this.#silent = true;

		if (typeof name === 'object') {
			for (let key in name) {
				this[key] = name[key];
			}
		} else if (typeof name === 'string') {
			this[name] = value;
		}

		// Enable events.
		this.#silent = oldSilent;
	}
}

export default EventDispatcher;



