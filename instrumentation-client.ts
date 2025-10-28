import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set environment
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  
  // Adds request headers and IP for users
  sendDefaultPii: true,
  
  // Performance monitoring
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  integrations: [
    // Session Replay - captures user interactions
    Sentry.replayIntegration({
      // Capture Replay for 10% of all sessions,
      // 100% of sessions with an error
      maskAllText: false,
      blockAllMedia: false,
    }),
    
    // User Feedback
    Sentry.feedbackIntegration({
      colorScheme: "system",
    }),
  ],
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Enable logs
  enableLogs: true,
  
  // Only enable Sentry in production or when DSN is set
  enabled: process.env.NODE_ENV === "production" || process.env.SENTRY_DSN !== undefined,
  
  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DSN) {
      return null;
    }
    
    // Filter out sensitive information
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    return event;
  },
});

// Export the required router transition hook
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;