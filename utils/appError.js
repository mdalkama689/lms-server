function createAppError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Error.captureStackTrace(error, createAppError);
  return error;
}

export default createAppError;
