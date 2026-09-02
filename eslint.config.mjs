// Flat ESLint config for the browser-side JavaScript under app/src/main/resources/static/js.
// Deliberately dependency-free so `npx eslint` works without a package.json install step.

export default [
  {
    files: ["app/src/main/resources/static/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        location: "readonly",
        alert: "readonly",
        confirm: "readonly",
        console: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        // Helpers defined in util.js and render.js and loaded via <script defer>
        setRole: "readonly",
        getRole: "readonly",
        clearRole: "readonly",
        setToken: "readonly",
        getToken: "readonly",
        clearToken: "readonly",
        logout: "readonly",
        logoutPatient: "readonly",
        formatDate: "readonly",
        formatTime: "readonly",
        todayISO: "readonly",
        showMessage: "readonly",
        selectRole: "readonly",
        renderHeader: "readonly",
        renderFooter: "readonly",
        renderContent: "readonly",
        baseHeader: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { args: "none" }],
      "no-dupe-keys": "error",
      "no-unreachable": "error",
      eqeqeq: ["warn", "smart"],
      "no-var": "error",
      "prefer-const": "warn"
    }
  }
];
