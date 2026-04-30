export default {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/test/**",
    "!src/docs/**",
    "!src/index.js",
    "!src/validators/**",
  ],
};
