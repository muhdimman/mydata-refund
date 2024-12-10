'use strict';
var Polyglot, I18n;

Polyglot = require('node-polyglot');

I18n = (function() {
  function I18n() {
    this.polyglot = new Polyglot();
    this.locales = {};
  }

  I18n.prototype.requireLocales = function(locales) {
    this.locales = locales;
    this.setLocale(Object.keys(locales)[0]);
    return this;
  }

  I18n.prototype.setLocale = function(locale) {
    if(!locale) locale = 'en-gb';
    var message = 'Cannot find locale: ' + locale;

    if (!this.locales[locale]) throw message;

    this.polyglot.clear();
    try {
      this.polyglot.extend(this.locales[locale]);
    }
    catch(error) {
      throw message;
    }
    return this;
  };

  I18n.prototype.t = function(key, options) {
    return (options) ? this.polyglot.t(key, options) : this.polyglot.t(key);
  };

  return I18n;
})();

module.exports = new I18n();
