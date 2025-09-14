// Error handling utilities for the Mind Mapping App

export interface ErrorContext {
  context?: string;
  userId?: string;
  mindMapId?: string;
  nodeId?: string;
  action?: string;
  [key: string]: unknown;
}

export interface ErrorReport {
  error: Error;
  context?: ErrorContext;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

// Central error reporting function
export function reportError(error: Error, context?: ErrorContext): void {
  const errorReport: ErrorReport = {
    error,
    context,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', errorReport);
  }

  // In production, you would send this to your error tracking service
  // e.g., Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorTrackingService(errorReport);
  }
}

// App-level error message for Mind Mapping App
export function getAppErrorMessage() {
  return 'An error occurred in Mind Mapping App.';
}

// Handle API errors
export function handleApiError(error: unknown, context?: ErrorContext): string {
  let message = 'An unexpected error occurred';

  const apiError = error as { response?: { data?: { error?: string } }; message?: string };

  if (apiError?.response?.data?.error) {
    message = apiError.response.data.error;
  } else if (apiError?.message) {
    message = apiError.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  reportError(error instanceof Error ? error : new Error(message), context);
  return message;
}

// Handle async operations with error reporting
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    reportError(error as Error, context);
    return null;
  }
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        reportError(lastError, { ...context, finalAttempt: true, attempts: attempt + 1 });
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Error boundary helper for React components
export function createErrorHandler(componentName: string) {
  return (error: Error, errorInfo: unknown) => {
    const errorInfoObj = errorInfo as { componentStack?: string };
    reportError(error, {
      context: 'React Error Boundary',
      component: componentName,
      errorInfo: errorInfoObj?.componentStack || 'No component stack available'
    });
  };
}

// Validation error helper
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Network error helper
export class NetworkError extends Error {
  constructor(message: string, public status?: number, public url?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Permission error helper
export class PermissionError extends Error {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'PermissionError';
  }
}