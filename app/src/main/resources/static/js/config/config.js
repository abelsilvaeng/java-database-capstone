// config.js

/**
 * Base URL for every API call the frontend makes.
 *
 * An empty string means "same origin as the page", so `${API_BASE_URL}/doctor`
 * resolves to /doctor and works unchanged on http://localhost:8080, on a Cloud
 * IDE proxy URL, and behind Docker or any reverse proxy. Nothing environment
 * specific ever has to be edited or committed.
 *
 * Point it at an absolute URL only when the frontend is served from a different
 * host than the backend, for example:
 *   export const API_BASE_URL = "http://localhost:8080";
 */
export const API_BASE_URL = "";
