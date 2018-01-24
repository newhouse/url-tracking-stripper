module.exports = {
  "env": {
    "browser": true,
    "node": false,
    "commonjs": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  // "ecmaFeatures": {
  //   "jsx": true
  // },
  // "parserOptions": {
  //   "ecmaFeatures": {
  //     "experimentalObjectRestSpread": true,
  //     "jsx": true,
  //     "modules": true,
  //     "classes": true
  //   },
  //   "sourceType": "module"
  // },
  // "plugins": [
  //   "react"
  // ],
  "rules": {
    "no-console":0,
    // "react/jsx-uses-vars": 1,
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    // "quotes": [
    //   "error",
    //   "single",
    //   "double"
    // ],
    "semi": [
      "error",
      "always"
    ]
  }
};