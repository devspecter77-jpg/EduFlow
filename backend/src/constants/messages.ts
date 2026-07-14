export const MESSAGES = {
  SERVER: {
    STARTED: 'Server is running on port',
    SHUTTING_DOWN: 'Server is shutting down gracefully...',
    SERVER_RUNNING: 'Server is running',
  },
  DATABASE: {
    CONNECTED: 'Database connected successfully',
    DISCONNECTED: 'Database disconnected',
    ERROR: 'Database connection error',
  },
  HEALTH: {
    OK: 'Server is running',
    SERVER_RUNNING: 'Server is running',
    DATABASE_CONNECTED: 'connected',
    DATABASE_DISCONNECTED: 'disconnected',
  },
  AUTH: {
    REGISTER_SUCCESS: 'Registration successful',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    LOGOUT_ALL_SUCCESS: 'Logged out from all devices',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    PROFILE_RETRIEVED: 'Profile retrieved successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
    TOKEN_REQUIRED: 'Access token is required',
    TOKEN_INVALID: 'Invalid or expired token',
    REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
    REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  },
  ERROR: {
    NOT_FOUND: 'Resource not found',
    INTERNAL_SERVER: 'Internal server error',
    VALIDATION: 'Validation failed',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    PERMISSION_DENIED: 'You do not have permission to access this resource',
  },
} as const;

export default MESSAGES;
