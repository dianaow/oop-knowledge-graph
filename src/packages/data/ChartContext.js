/** @format */

import ChartOption from '@/packages/data/types/ChartOption';
import DataType from '@/packages/data/types/DataType';

import AppEvent from '@/packages/events/AppEvent';
import EventDispatcher from '@/packages/events/EventDispatcher';
import AppEventType from '@/packages/events/types/AppEventType';
import ContextEventType from '@/packages/events/types/ContextEventType';

import throttler, { stopThrottler } from '@/utils/throttler';

import ChartContextStore from '@/packages/stores/ChartContextStore';

/**
 * Subscribe to store ignoring first fire.
 * @param {object} store - Svelte store.
 * @param {Function} handler - Events handler.
 * @returns {Function} - Function that can be called to unsubscribe.
 */
function subscribeIgnoreFirst(store, handler) {
	let firedFirst = false;
	return store.subscribe((...rest) => {
		if (!firedFirst) {
			firedFirst = true;
		} else {
			handler(...rest);
		}
	});
}

/**
 * Deeply convert store to an object.
 * @param {ChartContextStore || ChartContextStore[]} target - Store or array of stores to convert into name:value object.
 * @returns {object} Name:value object.
 */
function storeToObject(target) {
	if (!target) return target;

	const obj = target instanceof ChartContextStore ? target.value : target;

	if (Array.isArray(obj)) {
		return obj.map(v => storeToObject(v));
	} else if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	const res = {};
	for (let key in obj) {
		res[key] = storeToObject(obj[key]);
	}

	return res;
}

/**
 * Context that defines the type of chart and its options for getting data.
 * @see EventDispatcher
 * @class
 */
export default class ChartContext extends EventDispatcher {
	static GLOBAL = 'GLOBAL';
	static CURRENT_PAGE = 'CURRENT_PAGE';
	static SNAPSHOT = 'SNAPSHOT';

	#dataProperties;
	#parent;
	#parentSubscribes;
	#childrenSubscribes;
	#stores;
	#allProperties;
	#throttleChange;
	#throttleDataChange;
	#ownSubscribes;
	#filterSubscribes;
	#children;
	#eventBubbling;
	#filters;
	#pause;
	#alwaysOwnProperties;
	#chartOptions;
	#dataValuesChanged;
	#defaultValues;
	#savedState;
	#sourceContext;
	#sourceContextUnsubscribes;
	#sourceProperties;

	/**
	 * Accepts source of another instance of this class or use defaults.
	 * @param {ChartContext|null} parent - ChartContext instance to redirect unset getters.
	 * @param {*} initialValues - Set and init values for this context.
	 * @param {boolean} initlAll - Init every value, so that created context will be fully independed from parent.
	 * @constructor
	 */
	constructor(parent = null, initialValues = {}, initlAll = false) {
		super();

		// Saved values to restore after reset.
		this.#savedState = null;

		// Throttler to aggregate all changes.
		this.#throttleChange = throttler(
			function changed(names) {
				this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_COMPLETE, names));
			}.bind(this)
		);

		// Throttler to aggregate all changes.
		this.#throttleDataChange = throttler(
			function dataChanged(names) {
				this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_COMPLETE_DATA_TERMS, names));
			}.bind(this)
		);


		// Prevent changes flag.
		this.#pause = false;

		// Flag meaning to update options object on request.
		this.#dataValuesChanged = true;

		// Objects to store usubscribe functions, that returned from Svelte store subscribe methods.
		this.#parentSubscribes = {};
		this.#filterSubscribes = {};
		this.#ownSubscribes = {};
		this.#childrenSubscribes = new WeakMap();

		// Object to assing filter stores.
		this.#filters = {};

		// Registered children.
		this.#children = new Set();

		// If an event should bubble through parent instances.
		this.#eventBubbling = true;

		// Assign default values.
		this.#defaultValues = Object.assign(
			{
				[ChartOption.DATA_FIELD]: DataType.GRAPH,
				[ChartOption.COLOR_SCALE_REFERENCE]: 'DEFAULT',
				[ChartOption.CHART_VIEW]: DataType.GRAPH,
				[ChartOption.CHART_BACKGROUND]: 'transparent',
				[ChartOption.CHART_HEIGHT]: 1000,
				[ChartOption.VISIBLE]: true,
				[ChartOption.VIEW_STATE]: 'map',
				[ChartOption.VIEW_COUNTRY]: null
			},
			initialValues
		);

		// List of all properties available.
		this.#allProperties = Object.freeze([
			ChartOption.DATA_FIELD,
			ChartOption.COLOR_SCALE_REFERENCE,
			ChartOption.CHART_VIEW,
			ChartOption.CHART_BACKGROUND,
			ChartOption.CHART_HEIGHT,
			ChartOption.VISIBLE,
			ChartOption.VIEW_STATE,
			ChartOption.VIEW_COUNTRY
		])

		// Properties whose values should me merged into single object and whose changes will trigger data reload.
		this.#dataProperties = new Set([
			ChartOption.DATA_FIELD
		]);

		// Properties that belong only for this context.
		this.#alwaysOwnProperties = new Set([

		]);

		// Object to keep stores and determine which values should be used its own and which are taken from parent.
		// By default all are from the parent except those that initiated in constructor or when provided the `initAll` flag.
		this.#stores = this.#allProperties.reduce((acc, curr) => {
			acc[curr] = {
				store: new ChartContextStore(this.#defaultValues[curr]),
				ownValue: initialValues.hasOwnProperty(curr) || this.#alwaysOwnProperties.has(curr) || initlAll,
			};

			// Freeze always own stores.
			if (this.#alwaysOwnProperties.has(curr)) {
				Object.freeze(acc[curr]);
			}

			return acc;
		}, {});

		// Subscribe for all stores to update parent and dispatch events.
		for (const name in this.#stores) {
			this.subscribe(
				name,
				(value, oldValue, target) => {
					const { ownValue } = this.#stores[name];

					// Update parent store if value not local and parent is set.
					if (this.#parent && this.#parent !== target && !ownValue) {
						this.#parent.set(name, value);
					}

					// If given name is option property.
					if (this.#dataProperties.has(name)) {
						// Update options store
						this.#dataValuesChanged = true;

						// Dispatch data change event
						this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_DATA_TERMS, { name, value, oldValue }));

						// Capture event to dispatch several at once
						this.#throttleDataChange(name);
					}

					// Dispatch change event immediately.
					this.dispatchEvent(new AppEvent(ContextEventType.CHANGE, { name, value, oldValue }));

					// Capture event to dispatch several at once.
					this.#throttleChange(name);
				},
				true
			);
		}

		// Set parent
		parent && parent.addChild(this);

		// Apply accumulated events if silence mode is disabled.
		this.addEventListener(AppEventType.CHANGE_SILENCE, ({ data }) => {
			if (data?.length) {
				// Use only last triggered event of the same type.
				const uniqueEvents = data.reduceRight((acc, event) => {
					if (!acc.has(event.type)) {
						acc.set(event.type, event);
					}

					return acc;
				}, new Map());

				// Execute events in chronological order.
				Array.from(uniqueEvents)
					.reverse()
					.forEach(([type, event]) => this.dispatchEvent(event));
			}
		});

	}

	set eventBubbling(value) {
		if (this.#eventBubbling === value) {
			return;
		}

		this.#eventBubbling = value;
		this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_EVENT_BUBBLING, value));
	}

	updateOptions() {
		this.#chartOptions = storeToObject(
			Array.from(this.#dataProperties).reduce(
				(acc, curr) =>
					Object.assign(acc, {
						[curr]: this.store(curr),
					}),
				{}
			)
		);
	}

	/**
	 * Returns plain object of stores and values.
	 * @param {Array} props - Properties to include. Include all if null.
	 * @returns {object} - Key/value object of store name and value.
	 */
	toObject(props = null) {
		return storeToObject((props ?? this.#allProperties).map(name => this.store(name)));
	}

	/**
	 * Return store instance by name.
	 * @param {string} name - Data option name. @see ChartOption
	 * @returns {import('@/types/types').AppStore} - Svelte store instance.
	 */
	store(name) {
		return this.#stores[name].store;
	}

	/**
	 * Return store value by store value.
	 * @param {string} name - Data option name. @see ChartOption
	 * @returns {*} - Value of given store.
	 */
	value(name) {
		return this.store(name).value;
	}

	/**
	 * Return requested store value by store value.
	 * @param {string} name - Data option name. @see ChartOption
	 * @returns {*} - Requested value of given store. which can be different from current value if store on pause.
	 */
	requestedValue(name) {
		return this.store(name).requestedValue;
	}

	/**
	 * Returns copy of context values.
	 * @return {object} - Key/value object of properties.
	 */
	get values() {
		return Object.keys(this.#stores).reduce((acc, curr) => {
			acc[curr] = this.value(curr);
			return acc;
		}, {});
	}

	/**
	 * Set store value.
	 * Alias for this.store(name).set(value)
	 * @param {string} name - store name.
	 * @param {*} value - value to set.
	 */
	set(name, value) {
		// Clone data field objects if it is registered as own value of this context.
		if (name === ChartOption.DATA_FIELD && Array.isArray(value) && this.itsOwnProperty(name)) {
			this.store(name).set(value.map(ctx => ctx.clone()));
		} else {
			this.store(name).set(value);
		}
	}

	/**
	 * Execute given function with store value as first argument and update this store with value returned.
	 * @param {string} name - Store name.
	 * @param {Function} func - Function which returned value will be set to the given store.
	 */
	update(name, func) {
		this.set(name, func(this.value(name)));
	}

	/**
	 * Subsribe to store.
	 * @param {string} storeName - One of the ChartOption static properties.
	 * @param {Function} handler - Function to handle event.
	 * @param {boolean} ignoreFirst - Ignore first fire.
	 * @returns {Function} - Function to unsubscribe.
	 */
	subscribe(storeName, handler, ignoreFirst = false) {
		// Exit if no valid arguments provided.
		if (storeName === undefined || handler === undefined) {
			return;
		}
	
		// Create object for given store name to store handlers.
		this.#ownSubscribes[storeName] = this.#ownSubscribes[storeName] || new Map();

		// Exit if handler is already assigned to given store.
		if (this.#ownSubscribes[storeName].has(handler)) {
			return;
		}

		// Subscribe and store unsubscription function.
		this.#ownSubscribes[storeName].set(handler, ignoreFirst ? subscribeIgnoreFirst(this.store(storeName), handler) : this.store(storeName).subscribe(handler));

		// Return unsubscribe function.
		return this.#ownSubscribes[storeName].get(handler);
	}

	/**
	 *
	 * @param {string} storeName  - Full list of names: ChartOption.js.
	 * @param {*} handler  - Function to handle change event.
	 */
	unsubscribe(storeName, handler) {
		// Execure unsubscription for given hadler if exist.
		if (handler !== undefined) {
			this.#ownSubscribes?.[storeName]?.get(handler)();
			this.#ownSubscribes?.[storeName]?.delete(handler);
			return;
		}

		// If no handler profided try to unsubscribe everithing for given store.
		Array.from(this.#ownSubscribes?.[storeName] || []).forEach(([, value]) => value());
		delete this.#ownSubscribes?.[storeName];
	}

	/**
	 * Init value as its own, that is not redirect to the parent.
	 * @param {array} rest - Array of two or single element. First is a name @see ChartOption, second is an optional value for this name. If second element is not provided, using already existing value.
	 */
	init(...rest) {
		let name = rest[0];
		let value = rest.length > 1 ? rest[1] : this.value(name);

		// Unsubscribe from parent.
		if (this.#stores[name].ownValue === false) {
			this.#parentSubscribes?.[name]?.();
			delete this.#parentSubscribes?.[name];
			this.#stores[name].ownValue = true;
		}

		// Create clone of array if it was initiated.
		if (value && Array.isArray(this.value(ChartOption.DATA_FIELD))) {
			this.set(ChartOption.DATA_FIELD, this.value(ChartOption.DATA_FIELD).map(ctx => ctx.clone()));
		}

		this.set(name, value);
	}

	/**
	 * Remove its own value flag, that is parent value will be used.
	 * @param {string} name - Option name. @see ChartOption.
	 */
	delete(name) {
		// Ignore if already not using its own value.
		if (this.#stores[name].ownValue === false || this.#alwaysOwnProperties.has(name)) {
			return;
		}

		this.#stores[name].ownValue = false;

		// Subscribe to parents store.
		if (this.#parent) {
			this.#parentSubscribes?.[name]?.();
			this.#parentSubscribes[name] = this.#parent.store(name).subscribe(value => {
				// Update store value if another source is not set.
				if (!this.#sourceProperties?.includes(name)) {
					this.set(name, value);
				}
			});
		}
	}

	/**
	 * Set parent context.
	 * This component will get value from parent if no local value was init.
	 * @param {object} parentContext - Instance of ChartContext.
	 */
	set parent(parentContext) {
		if (parentContext === this.#parent) {
			return;
		}

		if (parentContext) {
			parentContext.addChild(this);
		} else {
			this.registerParent(null);
		}
	}

	get parent() {
		return this.#parent;
	}

	/**
	 * Register context to inherit values from this context.
	 * @param {ChartContext} context - Context to register.
	 */
	addChild(childContext) {
		// Return if no valid context provided.
		if (!(childContext instanceof ChartContext)) {
			return;
		}

		// Return if given context already registerd.
		if (this.#children.has(childContext)) {
			return;
		}

		// Subsribe for bubbling events and store unsubscribe function.
		this.#childrenSubscribes.set(childContext, childContext.addEventListener('*', this.#bubbleEvent.bind(this)));

		this.#children.add(childContext);

		// Set this as parent of the given child.
		childContext.registerParent(this);

		this.dispatchEvent(new AppEvent(ContextEventType.ADD_CHILD));
	}

	/**
	 * Add context which properties will overwrite this context properties.
	 * @param {ChartContext} sourceContext - Context to overwrite this context properties.
	 * @param {Array} properties - Array of properties to overwrite.
	 */
	setSourceProperties(sourceContext, properties = []) {
		this.removeSourceProperties();

		if (sourceContext) {
			this.#sourceContext = sourceContext;
			this.#sourceProperties = properties;

			// Subscribe to source context stores.
			this.#sourceContextUnsubscribes = properties.map(prop =>
				sourceContext.subscribe(prop, value => {
					if (this.#sourceProperties?.includes(prop)) {
						this.init(prop, value);
					}
				})
			);
		}
	}

	/**
	 * Clear source context properties.
	 */
	removeSourceProperties() {
		if (this.#sourceContext) {
			this.#sourceProperties?.forEach(prop => this.delete(prop));
			this.#sourceContextUnsubscribes?.forEach(unsubscribe => unsubscribe());
			this.#sourceContextUnsubscribes = null;
			this.#sourceContext = null;
		}
	}

	#bubbleEvent(event) {
		if (this.#eventBubbling) {
			this.dispatchEvent(event);
		}
	}

	/**
	 * Unregister child.
	 * @param {ChartContext} context - Context to unregister.
	 */
	removeChild(childContext) {
		this.#children.delete(childContext);
		this.#childrenSubscribes.get(childContext)?.();
		childContext.registerParent(null);
		this.dispatchEvent(new AppEvent(ContextEventType.REMOVE_CHILD));
	}

	/**
	 * Formally register the parent instance.
	 * @param {*} parentContext
	 */
	registerParent(parentContext) {
		if (this.parent) {
			const oldParent = this.#parent;
			this.#parent = null;
			oldParent.removeChild(this);
		}

		// Unsubscribe from previous parent.
		Object.values(this.#parentSubscribes).forEach(unsubscribe => unsubscribe());
		this.#parentSubscribes = {};

		// If given parent has this instance as child, which should be true if addChild method of the parent was invoked.
		if (parentContext?.children.has(this)) {
			// Assign private property.
			this.#parent = parentContext;

			this.#allProperties.forEach(prop => {
				// If not uses its own value.
				if (!this.#stores[prop].ownValue) {
					// Subscribe to according parent store to update its own store.
					this.#parentSubscribes[prop] = parentContext.store(prop).subscribe(value => {
						// Update store value if another source is not set.
						if (!this.#sourceProperties?.includes(prop)) {
							this.set(prop, value);
						}
					});
				}
			});
		}

		// Dispatch event.
		this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_PARENT, parentContext));
	}

	/**
	 * Returns set of direct children.
	 * @return {Set} - Children contexts of this context.
	 */
	get children() {
		return this.#children;
	}

	/**
	 * Returns set of all children, e.g. children of children and so on.
	 * @return {Set} - Children contexts.
	 */
	allChildren() {
		const res = new Set();

		this.#children.forEach(child => {
			res.add(child);
			child.allChildren().forEach(v => res.add(v));
		});

		return res;
	}

	/**
	 * @returns {ChartContext} - First parent node.
	 */
	get ancestor() {
		let ancestor = this;

		while (ancestor.parent) {
			ancestor = ancestor.parent;
		}

		return ancestor;
	}

	/**
	 * Whether filter is added.
	 * @param {string} type - Filter name. @see DataFilter.
	 * @returns {boolean} - True if filter is added.
	 */
	hasFilter(type) {
		return this.#filters.hasOwnProperty(type);
	}

	/**
	 * Get ot create filter and set listener to its changes.
	 * @param {string} type - Filter name. @see DataFilter.
	 */
	getFilter(type) {
		if (!this.#filters[type]) {
			this.#filters[type] = new ChartContextStore([]);
			this.set(ChartOption.FILTERS, storeToObject(this.#filters));

			// Save filter unsubscribe function.
			// Subscribe to filter changes to update options store and displatch event to the options subscribers.
			this.#filterSubscribes[type] = this.#filters[type].subscribe(() => {
				this.set(ChartOption.FILTERS, storeToObject(this.#filters));
			}, true);
		}

		return this.#filters[type];
	}

	/**
	 * Removes filter.
	 * @param {string} type - Name of the filter. @see DataFilter.js
	 */
	removeFilter(type) {
		this.#filterSubscribes?.[type]?.();
		delete this.#filters[type];
		this.set(ChartOption.FILTERS, storeToObject(this.#filters));
	}

	/**
	 * Removes subscribes.
	 */
	destroy() {
		if (this.destroyed) {
			console.warn('Attempt to destroy already destroyed context');
		}

		this.removeSourceProperties();

		// Unregister from the parent instance.
		this.parent = null;

		// Remove children.
		Array.from(this.#children).forEach(child => {
			this.removeChild(child);
		});

		try {
			// Unsubscribe from parent stores.
			Object.values(this.#parentSubscribes).forEach(unsubscribe => unsubscribe());
		} catch {
			console.error('Unsubscribe error.');
		}

		try {
			// Unsubscribe from filter stores.
			Object.values(this.#filterSubscribes).forEach(unsubscribe => unsubscribe());
		} catch {
			console.error('Unsubscribe error.');
		}

		try {
			// Unsubscribe from own stores.
			for (let storeName in this.#ownSubscribes) {
				Array.from(this.#ownSubscribes?.[storeName] || []).forEach(([, unsubscribe]) => unsubscribe());
			}
		} catch {
			console.error('Unsubscribe error.');
		}

		// Destroy every internal store.
		Object.values(this.#stores).forEach(({ store }) => {
			store.destroy();
		});

		// Dsipatch destroy event.
		this.dispatchEvent(new AppEvent(ContextEventType.DESTROYED));

		// Stop running throttlers.
		stopThrottler(this.#throttleChange);
		stopThrottler(this.#throttleDataChange);

		super.destroy();
	}

	/**
	 * Prevent changes for a while.
	 * @param {boolean} value - True to stop mutations, false to turn it on and apply last requested change.
	 */
	set pause(value) {
		if (this.#pause === value) {
			return;
		}

		// Pause each store.
		Object.keys(this.#stores).forEach(name => {
			this.#stores[name].store.pause = value;
		});

		this.#pause = value;

		this.dispatchEvent(new AppEvent(ContextEventType.CHANGE_PAUSE, value));
	}

	get pause() {
		return this.#pause;
	}

	get chartOptions() {
		if (this.#dataValuesChanged) {
			this.updateOptions();
			this.#dataValuesChanged = false;
		}

		return this.#chartOptions;
	}

	initAll() {
		this.#allProperties.forEach(prop => this.init(prop));
	}

	save() {
		this.#savedState = this.values;
	}

	reset() {
		this.pause = true;
		Object.entries(this.#savedState).forEach(([name, value]) => {
			this.set(name, value);
		});
		this.pause = false;
		this.dispatchEvent(new AppEvent(ContextEventType.RESET));
	}

	/**
	 * Parse path options and update context values.
	 * @param {string} - Options as JSON string.
	 * @returns {ChartContext} - Upated context.
	 */
	parsePathOptions(value) {
		let options = {};

		try {
			options = JSON.parse(value);
		} catch {
			console.warn('Provided options object is not valid.');
		}

		for (let name in options) {
			this.set(name, options[name]);
		}

		return this;
	}

	/**
	 * Create new instace with the same properties.
	 * @todo Make it work faster.
	 * @returns {ChartContext} - Copy of this context.
	 */
	clone() {
		const contextCopy = new ChartContext(
			null,
			allChartOptions.reduce((acc, curr) => {
				acc[curr] = this.value(curr);
				return acc;
			}, {})
		);

		// Delete properties that not its own.
		// allChartOptions.forEach(name => {
		// 	if (!this.hasOwnProperty(name)) {
		// 		contextCopy.delete(name)
		// 	}
		// })

		return contextCopy;
	}

	/**
	 * Whether given property is declared as its own.
	 * @param {string} name - ChartOption name.
	 * @returns {boolean} - True if given property is declared as its own.
	 */
	itsOwnProperty(name) {
		return this.#stores[name].ownValue;
	}
}


