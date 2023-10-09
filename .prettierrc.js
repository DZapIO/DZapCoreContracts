module.exports = {
  singleQuote: true,
  bracketSpacing: true,
  semi: false,
  overrides: [
    {
      files: '*.sol',
      options: {
        printWidth: 500,
        tabWidth: 4,
        singleQuote: false,
        explicitTypes: 'always',
      },
    },
  ],
}
