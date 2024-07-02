/**
 * Global store to dispatch data for all components.
 * @format
 **/

import uid from '@/utils/uid';

// Queue to forward each requests with its queue place.
const requestsQueue = {};

/**
 * Every call to this function should expect to receive Promise with requested data.
 * @param {string} dataType - See DataType.js class.
 * @param {Function} fetchFn - Function to retrieve data.
 * @return {Promise<Array>} - Promise that resolves with data.
 */

function get(dataType, options, fetchFn = fetch) {
	return createPromise(dataType, options, fetchFn)
}

async function createPromise(dataType, options, fetchFn) {
	try {
		const params = new URLSearchParams({
			options: JSON.stringify(options),
		});
		const query = params.toString();
		const resp = await fetchFn(`${import.meta.env.VITE_API_URL}/${dataType}?${query}`)

		if (!resp.ok) {
			let error = await resp.json();
			throw new Error(error?.errorMessage || resp.statusText);
		}
	
		let json = await resp.json();
		return json
	} catch (e) {
		console.log(e)
	}
}

const data = {
	get
};

export default data;

