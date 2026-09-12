// lib/api/flags.ts
// Single switch between the real backend and each feature folder's mock.ts. Mocks stay in
// the repo for laying out a screen without the backend running — flip this back to true
// (or set EXPO_PUBLIC_USE_MOCK_DATA=true) to work that way again.

export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
