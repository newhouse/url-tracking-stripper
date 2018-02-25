module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "chrome": true
  },
  "rules": {
    "no-console": 1,
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
    //   "single"
    // ],
    "semi": [
      "error",
      "always"
    ]
  }
};