export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.irondog.fit'
    : 'http://localhost:3001');
