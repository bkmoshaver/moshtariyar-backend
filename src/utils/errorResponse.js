const ErrorCodes = {
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR'
};

const errorResponse = (code, message, details = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
};

const successResponse = (data, message = null) => {
  return {
    success: true,
    message,
    data
  };
};

module.exports = {
  ErrorCodes,
  errorResponse,
  successResponse
};
