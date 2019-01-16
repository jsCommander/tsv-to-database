"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const stream_1 = require("stream");
/**
 * This class can write stream to sqlite database
 *
 * @export
 * @class SqliteWriteStream
 * @extends {Writable}
 */
class SqliteWriteStream extends stream_1.Writable {
    constructor(options) {
        super({ objectMode: true });
        this.insertTemplate = "INSERT INTO {{table}} ({{columns}}) VALUES ({{values}});";
        this.createTemplate = "CREATE TABLE IF NOT EXISTS {{table}} ({{columnTypes}});";
        this.isCreateSqlReady = false;
        this.isInsertSqlReady = false;
        this.isTableCreated = false;
        this.databasePath = `${__dirname}/output.db`;
        this.tableName = "parsed_tsv";
        if (options) {
            const { insertTemplate, tableName, createTemplate, databasePath, isTableCreated } = options;
            if (tableName) {
                this.tableName = tableName;
            }
            if (databasePath) {
                this.databasePath = databasePath;
            }
            if (isTableCreated) {
                this.isTableCreated = isTableCreated;
            }
            if (insertTemplate) {
                this.insertTemplate = insertTemplate;
                this.isInsertSqlReady = true;
            }
            if (createTemplate) {
                this.createTemplate = createTemplate;
                this.isCreateSqlReady = true;
            }
        }
        this.db = new better_sqlite3_1.default(this.databasePath);
    }
    _write(chunk, encoding, callback) {
        if (!this.isTableCreated) {
            let createSql = this.createTemplate;
            if (!this.isCreateSqlReady) {
                createSql = this._makeCreateSql(chunk[0]);
            }
            console.log(`I gonna to use this sql to create table:\n ${createSql}`);
            this.db.exec(createSql);
            this.db.exec("BEGIN");
            this.isTableCreated = true;
        }
        if (!this.insertStatement) {
            let insertSql = this.insertTemplate;
            if (!this.isInsertSqlReady) {
                insertSql = this._makeInsertSql(chunk[0]);
            }
            console.log(`I gonna to use this sql to isert values:\n ${insertSql}`);
            this.insertStatement = this.db.prepare(insertSql);
        }
        for (const item of chunk) {
            this.insertStatement.run(item);
        }
        callback();
    }
    _final(callback) {
        this.db.exec("COMMIT");
        this.db.close();
        callback();
    }
    _makeCreateSql(example) {
        const columns = Object.keys(example);
        const columnTypes = columns.reduce((acc, item, index) => {
            let type = index === 0 ? "`" + item + "` " : ",`" + item + "` ";
            const value = example[item];
            if (typeof value === "number") {
                type += value % 1 === 0 ? "INTEGER" : "REAL";
            }
            else {
                type += "TEXT";
            }
            return (acc += type);
        }, "");
        let sql = this.createTemplate.replace("{{table}}", this.tableName);
        sql = sql.replace("{{columnTypes}}", columnTypes);
        return sql;
    }
    _makeInsertSql(example) {
        const columns = Object.keys(example);
        let sql = this.insertTemplate.replace("{{table}}", this.tableName);
        sql = sql.replace("{{columns}}", columns.map(x => "`" + x + "`").join());
        const values = columns.map(x => `@${x}`).join();
        sql = sql.replace("{{values}}", values);
        return sql;
    }
}
exports.SqliteWriteStream = SqliteWriteStream;
//# sourceMappingURL=SqliteWriteStream.js.map