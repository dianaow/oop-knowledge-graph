/** @format */

// Object to send EventDispatcher subscribers

class AppEvent {
	#oldData;
	#bubbled;

	constructor(type, data, target) {
		this._type = type;
		this._target = target;
		this._data = data;
		this.#bubbled = false;
	}

	get type() {
		return this._type;
	}

	set target(value) {
		this._target = value;
	}

	get target() {
		return this._target;
	}

	get data() {
		return this._data;
	}

	set oldData(value) {
		this.#oldData = value;
	}

	get oldData() {
		return this.#oldData;
	}

	get bubbled() {
		return this.#bubbled;
	}

	/**
	 * Set bubbled flag. Intended to be used by EventDispatcher.
	 * @param {boolean} value
	 */
	set _bubbled(value) {
		this.#bubbled = value;
	}
}

export default AppEvent;
