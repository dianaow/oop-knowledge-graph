/** @format */

let names = {};
/**
 * Generates global unique Id
 *
 * @param {string} name - Optional name
 * @returns {string} Unique Id
 */
export default function uid(name = '') {
	const formattedName = name.toLowerCase().replace(/\s+/g, '-');
	names[formattedName] = names[formattedName] || 0;
	return `${formattedName}-${++names[formattedName]}`;
}
