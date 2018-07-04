const Writable = require('stream').Writable;
const sqlite3 = require('better-sqlite3');

const defaultOptions = {
  tableName: 'someTable',
  batchSize: 50000,
  insertStatment: null,
  isTableCreated: false,
};

class SqliteWriteStream extends Writable {
  constructor(dbName, options) {
    super({ objectMode: true });
    if (!dbName) {
      throw new Error('dbName is missing');
    }
    this.db = new sqlite3(dbName);
    this.options = Object.assign({}, defaultOptions, options);

    this.counter = 0;
    this.isTransactionRun = false;
  }

  _write(obj, encoding, callback) {
    if (!this.options.isTableCreated) {
      const headers = Object.keys(obj);
      this.db.prepare(this.createTableSql(headers)).run();
      this.options.isTableCreated = true;
    }

    if (!this.options.insertStatment) {
      const headers = Object.keys(obj);
      this.options.insertStatment = this.db.prepare(this.createInsertSql(headers));
    }

    if (!this.isTransactionRun) {
      this.beginTransaction();
    }

    this.options.insertStatment.run(obj);
    this.counter++;

    if (this.counter > this.options.batchSize) {
      this.endTransaction();
    }

    callback();
  }

  _final(callback) {
    if (this.isTransactionRun) {
      this.endTransaction();
    }
    this.db.close();
    callback();
  }

  beginTransaction() {
    this.db.exec('BEGIN');
    this.isTransactionRun = true;
  }

  endTransaction() {
    this.db.exec('COMMIT');
    this.counter = 0;
    this.isTransactionRun = false;
  }
  /**
   * Take columns name string array and create table. All columns will have TEXT type, first column will be PRIMARY KEY
   * @param {[String]} headers Array of string, that will be used as table columns
   */
  createTableSql(headers) {
    const sql = headers.reduce((acc, item, index) => {
      item = item.split([' ', '(', ')']).join('');
      if (index === 0) {
        return acc + `"${item}" text PRIMARY KEY,`;
      } else {
        return acc + `"${item}" text NOT NULL,`;
      }
    }, `CREATE TABLE IF NOT EXISTS ${this.options.tableName} (`);
    return sql.slice(0, -1) + ')';
  }
  /**
   * Take columns name string array and create insert SQL statment.
   * @param {[String]} headers Array of string, that will be used as table columns
   */
  createInsertSql(headers) {
    const sql = headers.reduce(
      (acc, item) => `${acc} @${item},`,
      `INSERT OR REPLACE INTO ${this.options.tableName} VALUES (`,
    );
    return sql.slice(0, -1) + ')';
  }
}

module.exports = SqliteWriteStream;
