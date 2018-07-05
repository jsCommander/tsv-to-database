const fs = require('fs');
//const sqlite3 = require('better-sqlite3');
const {
  FilterTransformStream,
  TsvToJsonTransformStream,
  ProgressTransformStream,
  SqliteWriteStream,
} = require('./../index.js');

const tsvFilePath = './tests/cal.tsv';
const dbName = './tests/cal.db';

if (fs.existsSync(dbName)) {
  fs.unlinkSync(dbName);
}

const fileSize = fs.statSync(tsvFilePath).size;
const filter = obj => !obj.food.includes('Almonds');

fs.createReadStream(tsvFilePath)
  .pipe(new ProgressTransformStream(fileSize))
  .pipe(new TsvToJsonTransformStream())
  .pipe(new FilterTransformStream(filter))
  .pipe(new SqliteWriteStream(dbName));
