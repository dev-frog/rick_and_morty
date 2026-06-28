/**
 * Application Configuration
 * Centralized configuration management for the Rick and Morty Wiki
 */

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Rick and Morty Wiki',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'The ultimate Rick and Morty character encyclopedia',

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rickandmortyapi.com/api',
    characterEndpoint: process.env.NEXT_PUBLIC_API_CHARACTER_ENDPOINT || 'https://rickandmortyapi.com/api/character',
  },

  // UI Configuration
  ui: {
    charactersPerPage: 20,
    debounceDelay: 300,
    loadingTimeout: 10000,
  },

  // Status colors for consistent styling
  statusColors: {
    Alive: '#A3BE8C',
    Dead: '#BF616A',
    Unknown: '#EBCB8B',
  },
};

export default appConfig;
