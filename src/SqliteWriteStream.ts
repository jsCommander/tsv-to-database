import sqlite3, { Database, Statement } from "better-sqlite3";
import { Writable } from "stream";
import { IParsedObject, nodeCallback } from "./types";

interface ISqliteStreamOptions {
  databasePath?: string;
  tableName?: string;
  insertTemplate?: string;
  createTemplate?: string;
}

export class SqliteWriteStream extends Writable {
  private insertTemplate: string =
    "INSERT INTO {{table}} ({{columns}}) VALUES ({{values}});";
  private createTemplate: string =
    "CREATE TABLE IF NOT EXISTS {{table}} ({{columnTypes}});";
  private isCreateSqlReady: boolean = false;
  private isInsertSqlReady: boolean = false;
  private isTableCreated: boolean = false;
  private databasePath: string = `${__dirname}/output.db`;
  private tableName: string = "parsed_tsv";
  private db: Database;
  private insertStatement?: Statement;

  constructor(options?: ISqliteStreamOptions) {
    super({ objectMode: true });
    if (options) {
      const {
        insertTemplate,
        tableName,
        createTemplate,
        databasePath
      } = options;
      if (tableName) {
        this.tableName = tableName;
      }
      if (databasePath) {
        this.databasePath = databasePath;
      }
      if (insertTemplate) {
        if (insertTemplate.includes("{{values}}")) {
          this.insertTemplate = insertTemplate;
          this.isInsertSqlReady = true;
        } else {
          throw new Error(
            "SQL template does not contain '{{values}}' so I don't know where I need to put values"
          );
        }
      }
      if (createTemplate) {
        this.createTemplate = createTemplate;
        this.isCreateSqlReady = true;
      }
    }
    this.db = new sqlite3(this.databasePath);
  }

  public _write(
    chunk: IParsedObject[],
    encoding: string,
    callback: nodeCallback
  ): void {
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

  public _final(callback: nodeCallback) {
    this.db.exec("COMMIT");
    this.db.close();
    callback();
  }

  private _makeCreateSql(example: IParsedObject): string {
    const columns = Object.keys(example);

    const columnTypes = columns.reduce((acc, item, index) => {
      let type = index === 0 ? "`" + item + "` " : ",`" + item + "` ";
      const value = example[item];
      if (typeof value === "number") {
        type += value % 1 === 0 ? "INTEGER" : "REAL";
      } else {
        type += "TEXT";
      }
      return (acc += type);
    }, "");

    let sql = this.createTemplate.replace("{{table}}", this.tableName);
    sql = sql.replace("{{columnTypes}}", columnTypes);

    return sql;
  }

  private _makeInsertSql(example: IParsedObject): string {
    const columns = Object.keys(example);
    let sql = this.insertTemplate.replace("{{table}}", this.tableName);
    sql = sql.replace("{{columns}}", columns.map(x => "`" + x + "`").join());
    const values = columns.map(x => `@${x}`).join();
    sql = sql.replace("{{values}}", values);
    return sql;
  }
}
