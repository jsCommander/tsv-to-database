const zlib = require('zlib');
const request = require('request');

const {
  FilterTransformStream,
  TsvToJsonTransformStream,
  ProgressTransformStream,
  SqliteWriteStream,
} = require('tsv-to-json');

const dbName = 'movie.db';
const filter = obj => obj.titleType === 'movie';

request.get('https://datasets.imdbws.com/title.basics.tsv.gz').on('response', response => {
  const size = Number(response.headers['content-length']);
  response
    .pipe(new ProgressTransformStream(size))
    .pipe(zlib.createGunzip())
    .pipe(new TsvToJsonTransformStream())
    .pipe(new FilterTransformStream(filter))
    .pipe(new SqliteWriteStream(dbName, { tableName: 'basic' }));
});
