/** @format */

import AppStore from './AppStore';
import { valuesAreEqual } from '@/utils/comparison';

/**
 * AppStore with additional equality check.
 */
export default class ChartContextStore extends AppStore {
	constructor(value) {
		super(value);
	}

	/**
	 * Set current value.
	 * @param {*} value - Value to set.
	 */
	set value(value) {
		if (valuesAreEqual(value, super.value)) {
			return;
		}

		super.value = value;
	}

	get value() {
		return super.value;
	}

	/**
	 * Decorator for value setter with force flag which allows to ignore equality check,
	 * @param {*} value - Value to set.
	 * @param {*} force - Ignore equality check.
	 */
	set(value, force = false) {
		if (force) {
			super.value = value;
		} else {
			this.value = value;
		}
	}
}
