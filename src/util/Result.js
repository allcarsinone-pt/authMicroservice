/* eslint-disable n/no-callback-literal */
class Result {
  static success (data) {
    return {
      success: true,
      data,
      error: undefined
    }
  }

  static failed (error) {
    return {
      success: false,
      data: undefined,
      error
    }
  }
}

/**
 * @description Handle errors from async functions
 * @param {*} callback async function to be executed with error handling
 * @returns an async function with error handling
 */
function handleError (callback) {
  return async function (...args) {
    try {
      return await callback(...args)
    } catch (error) {
      return Result.failed(error)
    }
  }
}

module.exports = { Result, handleError }
