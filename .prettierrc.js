module.exports = {
 
  singleQuote: true,
  bracketSpacing: true,
  semi: false,
  overrides: [
    {
      files: '*.sol',
      options: {
        printWidth: 150,
        tabWidth: 4,
        singleQuote: false,
        explicitTypes: 'preserve'
      },
    },
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        useTabs: false,
        printWidth: 20,
        singleQuote: true
      },
    },
  ],
}
