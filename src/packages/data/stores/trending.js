/** @format */

import ChartContext from '@/packages/data/ChartContext';

/**
 * Store contexts by name.
 * @type {Object.<string, import('@/types/types').ChartContext>}
 */
const contexts = {};

/**
 * Create context with given name. If such context already exist - destroy it before creating new one.
 * @param {*} name - Name associated with the context.
 * @param {*} options - ChartContext options.
 * @returns {ChartContext} - New ChartContext instance.
 */
function createContext(name, options) {
	// Destroy existing context
	contexts[name]?.destroy();
	contexts[name] = new ChartContext(null, options);
	return contexts[name];
}

/**
 * Check if context with given name already created.
 * @param {*} name - Name associated with the context.
 * @returns {boolean} - True if context with geven name already created.
 */
function contextExist(name) {
	return contexts.hasOwnProperty(name);
}

/**
 * Create context with given name or return already created.
 * @param {string} name - Name associated with the context.
 * @param {Object.<string, any>} options - ChartContext options.
 * @returns {ChartContext} - ChartContext instance.
 */
function getOrCreateContext(name, options = {}) {
	if (contextExist(name)) {
		const context = getContext(name);
		for (let key in options) {
			context.init(key, options[key]);
		}

		return context;
	} else {
		return createContext(name, options || {});
	}
}

/**
 * Returns context with given name or create new one.
 * @param {string} name - Context name.
 * @returns {ChartContext} - ChartContext instance.
 */
function getContext(name) {
	return contexts[name];
}

export { createContext, getOrCreateContext, contextExist, getContext};
