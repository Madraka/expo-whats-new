module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
};
