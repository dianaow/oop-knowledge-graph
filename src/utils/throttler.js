/** @format */

// Corrent tick to call all callbacks at once.
let globalTick = null;

/**
 * Callbacks to run on next tick.
 */
const pendingCallbacks = new Map();

/**
 * Create throttler to accumulate events in a small period of time and fire it at once.
 * @format
 * @param {function} callback - Function to call.
 * @returns {function} - Function that should be called on every event to aggregate them.
 */

export default function throttler(callback, delay = 0) {
	let cancelFunc = null;

	/**
	 * Function to capture event.
	 * @param {string} name - Event name that will stored and passed to callback along with others.
	 */
	const throttleCallback = function (name) {
		pendingCallbacks.set(callback, pendingCallbacks.get(callback)?.add(name) || new Set([name]));

		if (delay && cancelFunc === null) {
			cancelFunc = tick(() => {
				callback(pendingCallbacks.get(callback));
				cancelFunc = null;
			}, delay);
		} else if (globalTick === null) {
			globalTick = tick(() => {
				resolveTick();
			});
		}
	};

	throttleCallback.stop = function () {
		pendingCallbacks.delete(callback);
		cancelFunc?.();
	};

	return throttleCallback;
}

/**
 * Run all callbacks and set current tick to null.
 */
function resolveTick() {
	for (const [callback, names] of pendingCallbacks) {
		callback(names);
	}

	pendingCallbacks.clear();
	globalTick = null;
}

/**
 * Create delay and return cancel function.
 * @param {*} handler
 * @param {*} delay
 * @returns {function} - Function to abort delayed execution.
 */
function tick(handler, delay) {
	// It is important to use appropriate cancel functions because requestAnimationFrame can have the same id as setTimeout in other execution context and we can cancel timeout which was created in other context.
	if (delay || typeof window === 'undefined') {
		const timeoutId = setTimeout(handler, delay);
		return () => {
			clearTimeout(timeoutId);
		};
	} else {
		const cancelFunc = requestAnimationFrame(handler);
		return () => {
			cancelAnimationFrame(cancelFunc);
		};
	}
}

/**
 * Stop throttler by provided function.
 * @param {Function} func - Function created by throttler.
 */
export function stopThrottler(func) {
	func.stop();
}
