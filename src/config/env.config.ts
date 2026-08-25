export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/graphql',
  restUrl: import.meta.env.VITE_REST_URL || '',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/graphql',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;