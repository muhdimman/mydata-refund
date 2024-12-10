'use strict';
var i18n, testLocales;

jest.dontMock('../i18n');
i18n = require('../i18n');
testLocales = {
  'en-gb': {'title': 'Star Wars'},
  'fr': {'title': 'Etoile Guerres'}
};

describe('Initialization', function() {
  it('creates an instance of node-polyglot', function() {
    var Polyglot = require('node-polyglot')
    expect(i18n.polyglot.constructor.name).toBe(new Polyglot().constructor.name);
  });

  it('defaults the locales container to an empty object', function() {
    expect(i18n.locales).toEqual({});
  });
});

describe('#requireLocales', function() {
  beforeEach(function() {
    i18n.requireLocales(testLocales);
  });

  it('sets the required locale data', function() {
    expect(i18n.locales).toEqual(testLocales);
  });

  it('sets the initial selected locale to the first loaded locale', function() {
    expect(i18n.polyglot.clear).toBeCalled();
    expect(i18n.polyglot.extend).toBeCalledWith({'title': 'Star Wars'});
  });
});

describe('#setLocale', function() {
  beforeEach(function() {
    i18n.locales = testLocales;
  });

  it('creates a clean array dataset in polyglot', function() {
    i18n.setLocale('fr');
    expect(i18n.polyglot.clear).toBeCalled();
    expect(i18n.polyglot.extend).toBeCalledWith({'title': 'Etoile Guerres'});
  });

  it('defaults the locale to `en-gb` if no parameter is given', function() {
    i18n.setLocale();
    expect(i18n.polyglot.clear).toBeCalled();
    expect(i18n.polyglot.extend).toBeCalledWith({'title': 'Star Wars'});
  });

  it('throws an error if the locale is not found', function() {
    expect( function() {i18n.setLocale('de')} ).toThrow('Cannot find locale: de');
  });
});

describe('#t', function() {
  it('calls polyglot translation with a single parameter when only a key is passed', function() {
    i18n.t('key');
    expect(i18n.polyglot.t).toBeCalledWith('key');
  });

  it('calls polyglot translation with two parameters when a key and options are passed', function() {
    i18n.t('key', {'name': 'Darth Vader'});
    expect(i18n.polyglot.t).toBeCalledWith('key', {'name': 'Darth Vader'});
  });

  it('returns the translated string', function() {
    i18n.polyglot.t.mockReturnValue('Luke Skywalker');
    expect(i18n.t('jedi')).toEqual('Luke Skywalker');
  });
});
