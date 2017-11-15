# node-csvjson

Generate static JSON from CSV key/value data.


## Getting Started

Using npm:
```shell
npm install node-csvjson --save-dev
```
Using yarn:
```shell
yarn install node-csvjson --save
```


## Usage
Short version
```shell
require('node-csv-json')('directory containing csv files');


```

### Overview

This task builds JSON structures from key/value data defined in CSV format.
Multiple JSON resources can be defined per CSV document.

The following CSV document:

| key  | bob   | sue    |
| ---- | ----- | ------ |
| name | Bob   | Sue    |
| sex  | male  | female |
| age  | 54    | 24     |

Will generate two JSON resources:

```js
// dest/bob.json
{
	"name": "Bob",
	"sex": "male",
	"age": 54
}

// dest/sue.json
{
	"name": "Sue",
	"sex": "female",
	"age": 24
}
```


### Options

#### options
Type: `Object`

CSV parser options: see [node-csv-parse#parser-options](https://github.com/wdavidw/node-csv-parse#parser-options).

```js
options = {
	auto_parse : true
};
```


#### options.processValue
Type: `Function`

Hook to process field value.

```js
options = {
	processValue: function (key, value) {
		return value;
	}
};
```


## CSV format

The expected format is one row per value, with resource names defined in the first row,
and field keys in the first column.

| key     | resource-a |
| ------- | ---------- |
| key-one | value-one  |
| key-two | value-two  |


### Object hierarchy

Object hierarchy is expressed with dot notation in the key.

The following data:

| key         | bob   |
| ----------- | ----- |
| person.name | Bob   |
| person.sex  | male  |
| person.age  | 54    |

Will generate:

```json
{
	"person": {
		"name": "Bob",
		"sex": "male",
		"age": 54
	}
}
```


### Implicit array syntax

Arrays of values can be implicitly defined by duplicating keys.

The following data:

| key           | list    |
| ------------- | ------- |
| shopping.day  | Sunday  |
| shopping.list | fruit   |
| shopping.list | candy   |
| shopping.list | pasta   |
| shopping.list | spinach |

Will generate:

```json
{
	"shopping": {
		"day": "Sunday",
		"list": ["fruit", "candy", "pasta", "spinach"]
	}
}
```


### Explicit array syntax

Arrays of values can be explicitly defined by using integer keys.

The following data:

| key       | list    |
| --------- | ------- |
| list.0.0  | fruit   |
| list.0.1  | candy   |
| list.1.0  | pasta   |
| list.1.1  | spinach |

Will generate:

```json
{
	"list": [
		["fruit", "candy"],
		["pasta", "spinach"]
	]
}
```
# node-csvjson
