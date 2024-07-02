/** @format */

import uid from '@/utils/uid';

/**
 * Context event types.
 */
export default class ContextEventType {
	static CHANGE = uid('CHANGE');
	static CHANGE_COMPLETE = uid('CHANGE_COMPLETE');
	static CHANGE_COMPLETE_DATA_TERMS = uid('CHANGE_COMPLETE_DATA_TERMS');
	static CHANGE_BUCKET = uid('CHANGE_BUCKET');
	static CHANGE_TIME_RANGE = uid('CHANGE_');
	static CHANGE_TIME_RANGE_TWEEN = uid('CHANGE_TIME_RANGE_TWEEN');
	static CHANGE_USERS = uid('CHANGE_USERS');
	static CHANGE_FILTERS = uid('CHANGE_FILTERS');
	static CHANGE_USER_ID = uid('CHANGE_USER_ID');
	static CHANGE_EVENT = uid('CHANGE_EVENT');
	static CHANGE_OPTIONS = uid('CHANGE_OPTIONS');
	static CHANGE_DATA_TERMS = uid('CHANGE_DATA_TERMS');
	static CHANGE_PARENT = uid('CHANGE_PARENT');
	static CHANGE_EVENT_BUBBLING = uid('CHANGE_EVENT_BUBBLING');
	static CHANGE_FREEZE = uid('CHANGE_FREEZE');
	static CHANGE_PAUSE = uid('CHANGE_PAUSE');
	static DESTROYED = uid('DESTROYED');
	static ADD_CHILD = uid('ADD_CHILD');
	static REMOVE_CHILD = uid('REMOVE_CHILD');
	static CHANGE_GLOBAL_Y_SCALE_STATE = uid('CHANGE_GLOBAL_Y_SCALE_STATE');
	static RESET = uid('RESET');
	static RELOAD = uid('RELOAD');
}
