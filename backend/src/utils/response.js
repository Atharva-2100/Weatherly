/**
 * Standardized Response Utility
 * Handles both AWS Lambda Proxy integration responses and Express responses.
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-user-id'
};

/**
 * Build a successful response payload
 */
function successResponse(data, statusCode = 200, extraHeaders = {}) {
  const body = {
    success: true,
    data
  };

  return {
    statusCode,
    headers: { ...CORS_HEADERS, ...extraHeaders },
    body: JSON.stringify(body)
  };
}

/**
 * Build an error response payload
 */
function errorResponse(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const body = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

/**
 * Helper to adapt an AWS Lambda handler into an Express route handler
 */
function adaptLambdaToExpress(lambdaHandler) {
  return async (req, res) => {
    const event = {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers,
      queryStringParameters: req.query || {},
      pathParameters: req.params || {},
      body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null
    };

    try {
      const response = await lambdaHandler(event);
      res.status(response.statusCode);
      if (response.headers) {
        for (const [key, value] of Object.entries(response.headers)) {
          res.setHeader(key, value);
        }
      }
      res.send(JSON.parse(response.body));
    } catch (err) {
      console.error('Unhandled route error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err.message || 'Internal Server Error'
        }
      });
    }
  };
}

module.exports = {
  CORS_HEADERS,
  successResponse,
  errorResponse,
  adaptLambdaToExpress
};
