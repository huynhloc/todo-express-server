import validator from 'validator'
import R from 'ramda'

/**
 * validate admin form 
 * @param {Object} params 
 * @param {isUpdate} boolean
 * @param {currentUserRole} string
 * @param {isUpdate} boolean
 * @returns {Object} errors
 */
export function validateTask(params) {
  let errors = {}
  let { title } = params

  if (!title || validator.isEmpty(title.toString().trim())) errors.title = 'Title is required'
  return R.keys(errors).length > 0 ? errors : null
}