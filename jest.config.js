export default {
  testEnvironment: "node",
  globalSetup: "./src/test/setup.js",
  globalTeardown: "./src/test/teardown.js",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/test/**",
    "!src/docs/**",
    "!src/index.js",
    "!src/validators/**",
  ],
};
