/**
 * @typedef {Object} Profile
 * @property {string} id - UUID
 * @property {string} name - User name
 * @property {string} color - Hex color
 * @property {string[]} days_off - Days off
 * @property {string} constraints - Free text constraints
 */

/**
 * @typedef {Object} PlanningConfig
 * @property {string} id - UUID
 * @property {string} name - Planning name
 * @property {'week'|'month'} period - Period type
 * @property {string} start_date - Start date
 * @property {string} work_start - Work start time
 * @property {string} work_end - Work end time
 * @property {string} lunch_start - Lunch start time
 * @property {string} lunch_end - Lunch end time
 * @property {number} slot_duration - Slot duration in minutes
 * @property {string} created_by - Creator UUID
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} config_id - Planning config UUID
 * @property {string} name - Task name
 * @property {string} assigned_to - User UUID
 * @property {'solo'|'common'|'flexible'} type - Task type
 * @property {'daily'|'weekly'|'once'|'custom'} recurrence - Recurrence type
 * @property {number} duration - Duration in minutes
 * @property {number} priority - Priority (1-5)
 * @property {string} color - Hex color
 * @property {string[]} preferred_days - Preferred days
 * @property {'morning'|'afternoon'|'evening'|'any'} preferred_time - Time preference
 */

/**
 * @typedef {Object} Milestone
 * @property {string} id - UUID
 * @property {string} config_id - Planning config UUID
 * @property {string} title - Milestone title
 * @property {string} assigned_to - User UUID
 * @property {'todo'|'in_progress'|'done'} status - Status
 * @property {string} target_date - Target date
 * @property {number} progress - Progress 0-100
 * @property {boolean} is_focus - Is focus of the period
 * @property {string} notes - Additional notes
 */

/**
 * @typedef {Object} PlanningSlot
 * @property {string} id - UUID
 * @property {string} config_id - Planning config UUID
 * @property {string} task_id - Task UUID
 * @property {string} assigned_to - User UUID
 * @property {string} day - Date
 * @property {string} start_time - Start time
 * @property {string} end_time - End time
 * @property {string} column_type - 'common' or user_id
 * @property {boolean} is_manual - Manually placed
 */

export {}
