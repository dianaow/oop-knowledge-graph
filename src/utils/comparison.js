/**
 * Check if two values are equal in terms of context.
 *
 * @format
 * @param {*} a - Any object.
 * @param {*} b - Any object.
 * @return {boolean} - True if objects are equal in terms of context.
 */

function valuesAreEqual(a, b) {
	return Object.is(a, b) || (Array.isArray(a) && Array.isArray(b) ? arraysAreEqual(a, b) : JSON.stringify(a) === JSON.stringify(b));
}

function arraysAreEqual(a, b) {
	return a.length === b.length && compareArraysByIndex(a, b);
}

function compareArraysByIndex(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (!valuesAreEqual(a[i], b[i])) {
			return false;
		}
	}

	return true;
}
export { valuesAreEqual };
