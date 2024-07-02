/** @format */

import * as d3 from 'd3';

import ConfigurableAppComponent from '@/packages/core/ConfigurableAppComponent';

import AppEvent from '@/packages/events/AppEvent';
import AppEventType from '@/packages/events/types/AppEventType';

import updateArray from '@/utils/data/updateArray';

/**
 * Basic class to create graphics instance.
 * @class
 * @see EventDispatcher
 */
class Sprite extends ConfigurableAppComponent {
	#root;
	#canvas;
	#parent;
	#children;
	#childrenContainer;
	#x;
	#y;
	#width;
	#height;
	#visible;

	/**
	 * @constructor
	 */
	constructor() {
		super();

		this.#root = d3.create('svg').classed(`sprite-root-${this.constructor.name}`, true).style('overflow', 'hidden').style('width', '100%').style('display', 'block');

		this.#childrenContainer = this.#root.append('g').attr('class', 'sprite-children');
		this.#children = [];
		this.#parent = null;
		this.visible = true;
	}

	/**
	 * Add child sprite.
	 * @param {Sprite} childSprite - Instance of Sprite class.
	 * @returns {Sprite} - Added instance.
	 */
	addChild(childSprite) {
		const index = this.#children.indexOf(childSprite);

		if (index >= 0) {
			this.#children.splice(index, 1);
		}

		this.#children.push(childSprite);
		childSprite.addTo(this);
		this.dispatchEvent(new AppEvent(AppEventType.ADD_CHILD, childSprite));
		return childSprite;
	}

	/**
	 * Remove child of this sprite.
	 * @param {Sprite} childSprite
	 */
	removeChild(childSprite) {
		const index = this.#children.indexOf(childSprite);

		if (index >= 0) {
			const child = this.#children[index];
			child.#parent = null;
			child.#root.node().remove();
			this.#children.splice(index, 1);
		}

		this.dispatchEvent(new AppEvent(AppEventType.REMOVE_CHILD, childSprite));
	}

	/**
	 * Remove this sprite from parent.
	 * @returns {Sprite} - This instance.
	 */
	remove() {
		if (this.parent) {
			this.parent.removeChild(this);
		}

		return this;
	}

	// Append d3 element to the canvas.
	appendElement(element) {
		// this.#childrenContainer.append(() => element.node())
		this.#childrenContainer.node().appendChild(element.node());
	}

	get childrenContainer() {
		return this.#childrenContainer;
	}

	// Add this sprite to another sprite.
	addTo(targetSprite) {
		targetSprite.appendElement(this.#root);
		this.#parent = targetSprite;
	}

	destroy() {
		super.destroy();
	}

	get parent() {
		return this.#parent;
	}

	get canvas() {
		return this.#canvas;
	}

	get root() {
		return this.#root;
	}

	/**
	 * Returns root SVG node.
	 * @returns {SVGElement} - Root node.
	 */
	getRootNode() {
		return this.#root.node();
	}

	/**
	 * @returns {number}
	 */
	get width() {
		return this.#width;
	}

	/**
	 * @returns {number}
	 */
	get height() {
		return this.#height;
	}

	/**
	 * @param {number} value
	 */
	set width(value) {
		if (this.#width === value) return;
		this.#width = value;
		this.#root.attr('width', value);
		this.dispatchEvent(new AppEvent(AppEventType.RESIZE));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_WIDTH));
	}

	/**
	 * @param {number} value
	 */
	set height(value) {
		if (this.#height === value) return;
		this.#height = value;
		this.#root.attr('height', value);
		this.dispatchEvent(new AppEvent(AppEventType.RESIZE));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_HEIGHT));
	}

	/**
	 * @returns {number}
	 */
	get x() {
		return this.#x;
	}

	/**
	 * @returns {number}
	 */
	get y() {
		return this.#y;
	}

	/**
	 * @param {number} value
	 */
	set x(value) {
		if (this.x === value) return;
		this.#x = value;
		this.#root.attr('x', value);
		this.dispatchEvent(new AppEvent(AppEventType.MOVE));
	}

	/**
	 * @param {number} value
	 */
	set y(value) {
		if (this.#y === value) return;
		this.#y = value;
		this.#root.attr('y', value);
		this.dispatchEvent(new AppEvent(AppEventType.MOVE));
	}

	/**
	 * @returns {Array.<import('@/types/types').Sprite>}
	 */
	get children() {
		return this.#children;
	}

	/**
	 * @param {Array.<import('@/types/types').Sprite>}
	 */
	set children(value) {
		updateArray(this.#children, v => v.id)
			.data(value, v => v.id)
			.join(
				enter => enter,
				update => update,
				exit => {
					this.removeChild(exit);
				}
			)
			.forEach(element => {
				this.addChild(element);
			});
	}

	/**
	 * @return {Object} - Container of children as d3 selection.
	 */
	get childrenContainer() {
		return this.#childrenContainer;
	}

	/**
	 * @param {boolean}
	 */
	set visible(value) {
		if (this.#visible === value) return;
		this.root.style('visibility', value ? 'visible' : 'hidden').style('display', value ? 'block' : 'none');
		this.#visible = value;
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_VISIBILITY));
	}

	/**
	 * @returns {boolean}
	 */
	get visible() {
		return this.#visible;
	}

}

export default Sprite;