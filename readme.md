This package help you to convert csv/tsv files to js object.

#Installation:
coming soon...

#Example of usage:

This example read stream from tsv file and write it to sqlite database
```
const fs = require('fs');
const {
  FilterTransformStream,
  TsvToJsonTransformStream,
  ProgressTransformStream,
  SqliteWriteStream,
} = require('./../index.js');

const tsvFilePath = './tests/cal.tsv';
const dataBaseName = './tests/cal.db';

const fileSize = fs.statSync(tsvFilePath).size;

fs.createReadStream(tsvFilePath)
  .pipe(new ProgressTransformStream(fileSize))
  .pipe(new TsvToJsonTransformStream())
  .pipe(new SqliteWriteStream(dataBaseName));
```

#Documentation

## TsvToJsonTransformStream
coming soon...

## SqliteWriteStream
coming soon...

## ProgressTransformStream
coming soon...

## FilterTransformStream
coming soon...
