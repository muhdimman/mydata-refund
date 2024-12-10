# Node Translate [![Build Status](https://travis-ci.org/thestonefox/node-translate.svg?branch=master)](https://travis-ci.org/thestonefox/node-translate)

A translation library for NodeJS that wraps [node-polyglot](https://www.npmjs.com/package/node-polyglot)

## Installation

To build a local version for use or development:
```
git clone git@github.com:thestonefox/node-translate.git
cd node-translate
npm install
```

Installing as a node module:

```
npm install node-translate --save
```

## Example

Look at the `example.js` file to see a simple example of the library.

Run it with `npm start`

For more examples of the format of the locale files, look in `./locales/`

```
module.exports = {
  "title": "Hello, World"
}
```

## Usage

Create a new instance of the i18n library.

```
var i18n = require('node-translate');
```

Require the relevant locale files in a associative array with the key
being the name of the locale and the value being the output of the
respective locale file.

```
i18n.requireLocales({
  'en-gb': require('./locales/en-gb'),
  'fr': require('./locales/fr')
});
```

Set the initial locale to use by providing the locale name. The first
specified required locale is used as the current locale by default.

```
i18n.setLocale('en-gb');
```

Now simply call the translation method with the key to translate.

```
i18n.t('title');
```

The t method is compatible with polyglot so takes an optional second parameter
for parsing variables into the translation string.

```
i18n.t('title', {name: "string"})
```

Chaining setters is also permitted.

```
i18n.requireLocales({'de': require('./locales/de')}).setLocale('de');
```

## Running Tests

To run the [Jest](https://github.com/facebook/jest) tests just type:

`npm test`
