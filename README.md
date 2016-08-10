# q42:mind-meld

Easily transfer collection data from one Meteor instance to another. Used to easily get production data on your development or acceptance environment without having to access your mongo database.
Most suitable for small datasets.

## Installation

	meteor add q42:mind-meld

Then add these settings to `settings.json`:

	{
	  "mindMeld": {
	    "password": "PASSWORD",
	    "allowImport": false
	  }
	}

## Usage
Mind Meld exposes 2 DDP methods: `mm_import` and `mm_export`. Combined, these enable transfer of full collections between applications. Both can be called from a browser console but they are protected with a password (`Meteor.settings.mindMeld.password`).

## `MindMeld.export(collectionName, password, callBack)`
The `mm_export` method returns a dump of the collection. You generally don't call this method yourself.

## `MindMeld.import({sourceUrl, sourcePassword, collections, localPassword, ...options})`
The `mm_import` method first calls `mm_export` on another Meteor instance, retrieving a collection dump, and imports the dump locally.

Because this method default removes all records from your database, you have to specifically enable it using `Meteor.settings.mindMeld.allowImport`. Normally you would disable this on your production system, and enable it on your development and acceptance environments.

Parameters:
* `sourceUrl` URL to the meteor instance that you want to copy the data from. Has to have this package installed.
* `sourcePassword` Meteor.settings.mindMeld.password of that Meteor instance.
* `collections` array of names of the collections you want to import. Use the (usually lowercased) name of the mongo collection.
* `localPassword` Meteor.settings.mindMeld.password of the destination Meteor instance that you're calling this method on.
* `keepCurrentData` optionally choose to append the imported data to the existing data in your database. Default `false`, will remove all entries from the collection before importing.
* `bypassCollection2` optionally choose to [bypass collection2's validation](https://github.com/aldeed/meteor-collection2#inserting-or-updating-bypassing-collection2-entirely), cleaning and autovalues. Defaults to `false` if collection2 is installed, and will use collection2 to validate and clean entries when they're imported.
* `enableHooks` optionally choose to enable before and after submit hooks, if the collection-hooks package is installed. Defaults to `false`, where the hooks will not be executed, instead using [collection.direct](https://github.com/matb33/meteor-collection-hooks#direct-access-circumventing-hooks).

### examples

To export collection `col1`:

	MindMeld.export('col1', 'password', (err,res) => {
		if (err) console.warn(err);
		console.log(res);
	});

To import collections `col1` & `col2` from instance `http://xx.yy.zz`:

	MindMeld.import({
	  sourceUrl: "http://xx.yy.zz",
	  sourcePassword: "PASSWORD1",
	  collections: ["col1", "col2"],
	  localPassword: "PASSWORD2"
	})

To import collections without having collection2 meddle with your records:

	MindMeld.import({
	  sourceUrl: "http://xx.yy.zz",
	  sourcePassword: "PASSWORD1",
	  collections: ["col1", "col2"],
	  localPassword: "PASSWORD2",
	  keepCurrentData: false,
	  bypassCollection2: true,
	  enableHooks: false
	})
