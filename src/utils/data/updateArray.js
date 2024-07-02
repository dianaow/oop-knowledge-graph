/**
 * Default function to get the element key.
 *
 * @format
 * @param {*} v - Element.
 * @param {*} i - Index.
 * @returns {string|number} - The key of the element.
 */

const idByIndex = (v, i) => i;

/**
 * Default function to handle iterated items of enter, update and exit calls.
 * @param {*} v
 * @returns
 */
const defaultHandler = v => v;

/**
 * Update array similar to the d3 `data` method but to update arbitrary objects, not only DOM elements.
 * @param {Array} arr - The array to update.
 * @param {Array} data - The new data.
 * @param {Function} arrayKey - Function to get the key of the array elements to match with data elements.
 * @param {Function} dataKey - Function to get the key of the data elements to match with array elements.
 * @returns {Array} - The updated array.
 */
function updateArray(arr, arrayKey = idByIndex) {
	return {
		data: data.bind({ arr, arrayKey }),
	};
}

/**
 * Join data with the array.
 * @param {*} value - Data to join with the array.
 * @param {*} dataKey - Function to access the key of the data elements to match with array elements.
 * @returns
 */
function data(value, dataKey = idByIndex) {
	(this.value = value), (this.dataKey = dataKey);

	// Create a set of the data keys.
	const dataIdSet = new Set(value.map(dataKey));

	// Create a map of the array elements by their keys.
	const arrById = new Map(this.arr.map((v, i) => [this.arrayKey(v, i), v]));

	// Elements to add.
	this.toAdd = [];

	// Elements to update.
	this.toUpdate = [];

	// Elements to remove.
	this.toRemove = [];

	this.arr.forEach((v, index) => {
		if (!dataIdSet.has(this.arrayKey(v, index))) {
			this.toRemove.push([v, index]);
		}
	});

	// Split the data into elements to add and elements to update.
	Array.from(dataIdSet.values()).forEach((dataId, dataIndex) => {
		if (arrById.has(dataId)) {
			this.toUpdate.push([arrById.get(dataId), dataIndex]);
		} else {
			this.toAdd.push([null, dataIndex]);
		}
	});

	return {
		join: join.bind(this),
	};
}

/**
 * Call corresponding functions on every element in the add, update and remove arrays.
 * @param {Function} enter - Function to call on every element to add.
 * @param {Function} update - Function to call on every element to update.
 * @param {Function} exit - Function to call on every element to remove.
 * @returns {Array} - The updated array.
 */
function join(enter = defaultHandler, update = defaultHandler, exit = defaultHandler) {
	const result = new Array(this.value.length);

	for (let [, index] of this.toAdd) {
		result[index] = enter && enter(this.value[index], null);
	}

	for (let [obj, index] of this.toUpdate) {
		result[index] = update && update(obj, this.value[index]);
	}

	for (let [obj, index] of this.toRemove) {
		exit && exit(obj, index);
	}

	return result;
}

export default updateArray;
