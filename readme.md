# Tsv to json conventer

This package will help you to convert csv/tsv files to js object and write it to file or database (sqlite3, mongodb).
Can automaticaly extract columns name from first line and guess type(string or number) from second line.
All operations use streams for low memory consumption.

## Installation

```npm
npm install tsv-to-database --save
```

## Example of usage

I created this packadge mostly for parse movies database from IMDB so in examples I show how to use streams to download, unzip, filter and write tsv files.
You can see imdb .tsv file structure [here](https://www.imdb.com/interfaces/). You can use [request.js](https://github.com/request/request) to get file from internet

### Write to file

This example shows how to read stream from input.tsv file and write it in output.json file

```javascript
const fs = require("fs");
const { TsvToObjectStream, ObjectToJsonStream } = require("tsv-to-database");

// read a file
fs.createReadStream("input.tsv")
  // transform bytes to object
  .pipe(new TsvToObjectStream())
  // transform objects to json string
  .pipe(new ObjectToJsonStream())
  // write string to file
  .pipe(fs.createWriteStream("output.json"));
```

If you tsv file doesn't have columns' names you must pass it

```javascript
new TsvToObjectStream({ columns: ["food", "calories", "fat", "protein"] });
```

If you want to use you own columns' names you must pass names in options and ignore first line

```javascript
new TsvToObjectStream({
  ignoreFirstLine: true,
  columns: ["food", "calories", "fat", "protein"]
});
```

### Write to sqlite3 database

This example read stream from url and write it to sqlite database

```javascript
const zlib = require("zlib");
const request = require("request");
const { TsvToObjectStream, SqliteWriteStream } = require("tsv-to-database");

const filter = obj => obj.titleType === "movie";

// get stream from internet
request("https://datasets.imdbws.com/title.basics.tsv.gz")
  // unzip
  .pipe(zlib.createGunzip())
  // transform bytes to object
  .pipe(new TsvToObjectStream())
  // write stream to sqlite
  .pipe(
    new SqliteWriteStream({
      databasePath: "imdb.db",
      tableName: "title_basics"
    })
  );
```

By default SqliteWriteStream automaticaly create table and insert statment. You can use your own create and insert templates. Stream replace all
{{something}} with correct values

```javascript
new SqliteWriteStream({
  databasePath: "imdb.db",
  tableName: "title_basics",
  insertTemplate: "INSERT INTO {{table}} ({{columns}}) VALUES ({{values}});",
  createTemplate: "CREATE TABLE IF NOT EXISTS {{table}} ({{columnTypes}});"
});
```

### Write to mongoDB database

This example read stream from url and write it to mongo database

```javascript
const zlib = require("zlib");
const request = require("request");
const { TsvToObjectStream, MongoWriteStream } = require("tsv-to-database");

// get stream from internet
request("https://datasets.imdbws.com/title.basics.tsv.gz")
  // unzip
  .pipe(zlib.createGunzip())
  // transform bytes to object
  .pipe(new TsvToObjectStream())
  // write stream to mongodb
  .pipe(
    new MongoWriteStream({
      databaseUrl: "mongodb://localhost:27017",
      databaseName: "imdb",
      collectionName: "title.basics"
    })
  );
```

### Filter data from stream

You can use filter and transform streams for filtering and transforming object from input stream. For example, you want to filter only good movies (rating>7)

```javascript
const zlib = require("zlib");
const request = require("request");

const {
  TsvToObjectStream,
  SqliteWriteStream,
  FilterStream
} = require("tsv-to-database");

const filter = data => data.averageRating > 8;

request("https://datasets.imdbws.com/title.ratings.tsv.gz")
  .pipe(zlib.createGunzip())
  .pipe(new TsvToObjectStream())
  .pipe(new FilterStream(filter))
  .pipe(
    new SqliteWriteStream({
      databasePath: "imdb.db",
      tableName: "title_ratings"
    })
  );
```

### Transform data from stream

For example, if you don't need all columns from table and want to rename startYear ("\N" to "unknown") you can use TransformStream

```javascript
const zlib = require("zlib");
const request = require("request");
const {
  TsvToObjectStream,
  MongoWriteStream,
  TransformStream
} = require("tsv-to-database");

const transform = data => {
  const transformed = {
    title: data.originalTitle,
    year: data.startYear !== "N" ? data.startYear : "unknown"
  };
  return transformed;
};

request("https://datasets.imdbws.com/title.basics.tsv.gz")
  .pipe(zlib.createGunzip())
  .pipe(new TsvToObjectStream())
  .pipe(new TransformStream(transform))
  .pipe(
    new MongoWriteStream({
      databaseUrl: "mongodb://localhost:27017",
      databaseName: "imdb",
      collectionName: "title.basics"
    })
  );
```

### Stream progress monitor

Sometimes it usefull to see how long you need to wait for stream finish. You can use ProgressStream to monitor elapsed time, persentage and memory consumption. Just pass file size to constructor (for internet file you can get size from headers)

```javascript
const zlib = require("zlib");
const request = require("request");

const {
  TsvToObjectStream,
  SqliteWriteStream,
  ProgressStream
} = require("tsv-to-database");

request("https://datasets.imdbws.com/title.ratings.tsv.gz").on(
  "response",
  responce => {
    const size = Number(response.headers["content-length"]);
    response
      .pipe(new ProgressStream(size))
      .pipe(zlib.createGunzip())
      .pipe(new TsvToObjectStream())
      .pipe(new FilterStream(filter))
      .pipe(
        new SqliteWriteStream({
          databasePath: "imdb.db",
          tableName: "title_ratings"
        })
      );
  }
);
```

### Without write stream

You can just subscribe for stream "data" event and work with data from stream.

```javascript
fs.createReadStream("input.tsv")
  .pipe(new TsvToObjectStream())
  .on("data", data => {
    /* your code here */
  });
```

## Documentation

### TsvToObjectStream

This class transform byte/string stream to objects. It extracts columns name from first line and types from second. If some columns have mixed type (number and string) than type fallback to "string"

```javascript
// default options
const options = {
  // encoding is used for decoding byte stream
  stringEncoding = "utf8",
  // skip first line in tsv file
  ignoreFirstLine = "false",
  // used to split text to lines
  lineSeparator = "\n",
  // used to line text to columns
  rowSeparator = "\n",
  // use it if you want to overide parsed columns name. You must provide string array with names for all columns
  columns,
  // use it if you want to overide parsed types. You must provide string array with type ("number" | "string") for all columns
  types
};
```

### SqliteWriteStream

This class write objects to sqlite database. It automaticaly create table if not exist and make insert statment. You can overide create and insert sql template. Possible template tokens:
{{table}} - table name
{{columns}} - parsed columns names
{{values}} - named parameters
{{columnTypes}} - parsed types

Class automaticaly found type of values (string or number) and add correct type to create table statment (TEXT or INTEGER). It can'not set PRIMARY key, if you need it so overide create sql statment. Be carefull with mixing data types in one column. This class make create table statment from first object. If it use number type and later value type changes to string than sqlite throw error. Better overide types in TsvToObjectStream class or provide create template with correct types.

```javascript
// default options
const options = {
  databasePath = "output.db",
  tableName = "parsed_tsv";
  insertTemplate = "INSERT INTO {{table}} ({{columns}}) VALUES ({{values}});",
  createTemplate = "CREATE TABLE IF NOT EXISTS {{table}} ({{columnTypes}});",
  // use it if you already have table in database
  isTableCreated = false
};
```

### MongoWriteStream

This class write object stream to mongodb.

```javascript
// default options
const options = {
  databaseName = "tsv_to_mongo",
  collectionName = "parsed_tsv",
  databaseUrl = "mongodb://localhost:27017"
};
```

### ProgressStream

Monitor passed time and percentage of parsed data.

```javascript
// @param size - size of stream in byte
// @param logEvery - how often show log. Default every 10 percent

new ProgressStream(size, logEvery);
```
