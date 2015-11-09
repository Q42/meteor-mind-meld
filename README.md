# q42:mind-meld

Easily transfer collection data from one Meteor instance to another. Most suitable for small datasets.

## Installation

	meteor add q42:mind-meld

## Usage
Mind Meld exposes 2 methods: `mm_import` and `mm_export`. Combined, these enable transfer of full collections between applications. Both can be called from a browser console but they are protected with a password (`Meteor.settings.MIND_MELD_TOKEN`).

## `mm_export(collectionName, password)`
The `mm_export` method returns a dump of the collection.


## `mm_import(url, [collections], password1, password2)`
The `mm_import` method first calls `mm_export` on another Meteor instance, retrieving a collection dump, and imports the dump locally. 

_note that the first password is for the Meteor instance you're call the import method on (destination) while the second password is for the instance you're importing from (source)._

### examples

To export collection `col1`:

	Meteor.call('mm_export', 'col1', 'password');

To import collections `col1` & `col2` from instance `http://xx.yy.zz`:

	Meteor.call('mm_import', 'http://xx.yy.zz', ['col1', 'col2'], 'pwd1', 'pwd2');