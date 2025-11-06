module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable problematic rules for production builds
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'warn',
    // Allow unused variables in development
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        // More lenient rules for React components
        'react-hooks/exhaustive-deps': 'off',
        'no-use-before-define': 'off',
      }
    }
  ]
};