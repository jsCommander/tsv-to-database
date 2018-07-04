const fs = require('fs');
//const sqlite3 = require('better-sqlite3');
const {
  FilterTransformStream,
  TsvToJsonTransformStream,
  ProgressTransformStream,
  SqliteWriteStream,
} = require('./../index.js');

const tsvFilePath = './tests/cal.tsv';
const dataBaseName = './tests/cal.db';

if (fs.existsSync(dataBaseName)) {
  fs.unlinkSync(dataBaseName);
}

const fileSize = fs.statSync(tsvFilePath).size;
const input = fs.createReadStream(tsvFilePath);
const filter = obj => !obj.food.includes('Almonds');

input
  .pipe(new ProgressTransformStream(fileSize))
  .pipe(new TsvToJsonTransformStream())
  .pipe(new FilterTransformStream(filter))
  .pipe(new SqliteWriteStream(dataBaseName));
