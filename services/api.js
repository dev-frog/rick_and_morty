/**
 * API Service
 * Centralized API communication layer with error handling and caching
 */

import appConfig from '../config/app';

class APIService {
  constructor() {
    this.baseURL = appConfig.api.baseUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key from URL and options
   */
  getCacheKey(url, options = {}) {
    return `${url}_${JSON.stringify(options)}`;
  }

  /**
   * Get cached response if available and not expired
   */
  getCached(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache a response
   */
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Handle API errors
   */
  handleError(error, context = 'API call') {
    console.error(`${context} error:`, error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        error: true,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }

    if (error.status === 404) {
      return {
        error: true,
        message: 'Resource not found.',
        status: 404,
      };
    }

    if (error.status === 500) {
      return {
        error: true,
        message: 'Server error. Please try again later.',
        status: 500,
      };
    }

    return {
      error: true,
      message: 'An unexpected error occurred.',
      status: error.status || 0,
    };
  }

  /**
   * Make a fetch request with caching and error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw { status: response.status, message: response.statusText };
      }

      const data = await response.json();

      // Cache successful responses
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      return this.handleError(error, `API fetch: ${endpoint}`);
    }
  }

  /**
   * Fetch all characters with pagination
   */
  async getCharacters(page = 1, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });

    return this.fetch(`/character?${queryParams}`);
  }

  /**
   * Search characters by name
   */
  async searchCharacters(query) {
    if (!query || query.trim() === '') {
      return this.getCharacters(1);
    }

    return this.fetch(`/character?name=${encodeURIComponent(query)}`);
  }

  /**
   * Get a single character by ID
   */
  async getCharacterById(id) {
    if (!id || typeof id !== 'number' && typeof id !== 'string') {
      return this.handleError({ status: 400 }, 'Get character by ID');
    }

    return this.fetch(`/character/${id}`);
  }

  /**
   * Get multiple characters by IDs
   */
  async getMultipleCharacters(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return this.handleError({ status: 400 }, 'Get multiple characters');
    }

    return this.fetch(`/character/${ids.join(',')}`);
  }
}

// Export singleton instance
export const apiService = new APIService();

// Export class for testing
export default APIService;
