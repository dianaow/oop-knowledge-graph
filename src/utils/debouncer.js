/** @format */

/**
 * Accumulate events if interval between them is too short.
 * @param {function} callback - Function to call.
 * @param {number} interval - Minimum milliseconds between events to aggregate them.
 * @param {number} maxInterval - Maximum time in milliseconds of aggregated events.
 * @returns {function} - Function that should be called on every event to aggregate them.
 */
export default function debouncer(callback, interval = 10, maxInterval = 100) {
	let sessionStart = null;
	let timeoutId = null;
	let eventNames = new Set();

	/**
	 * Function to capture event.
	 * @param {string} name - Event name that will stored and passed to callback along with others.
	 */
	let func = function (name) {
		// callback && callback(new Set([name]))
		// return

		clearTimeout(timeoutId);

		if (sessionStart === null) {
			sessionStart = Date.now();
			timeoutId = null;
			eventNames = new Set();
		}

		eventNames.add(name);

		if (Date.now() - sessionStart > maxInterval) {
			callback && callback(eventNames);
			sessionStart = null;
		} else {
			timeoutId = setTimeout(() => {
				callback && callback(eventNames);
				sessionStart = null;
			}, interval);
		}
	};

	func.stop = function () {
		clearTimeout(timeoutId);
		sessionStart = null;
	};

	return func;
}

export function stopDebouncer(instance) {
	instance.stop();
}
