module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
};
