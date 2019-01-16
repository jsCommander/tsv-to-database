import sqlite3 from "better-sqlite3";
import fs from "fs";
import { SqliteWriteStream, TsvToObjectStream } from "../../src/index";

describe("convert tsv file to sqlite3 database", () => {
  it("shoud correctly parse tsv file and convert it in sqlite3 database", () => {
    const tsvFilePath = `${__dirname}/input.tsv`;
    const dbPath = `${__dirname}/output.db`;
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    fs.createReadStream(tsvFilePath)
      .pipe(new TsvToObjectStream())
      .pipe(
        new SqliteWriteStream({
          databasePath: `${__dirname}/output.db`,
          tableName: "food"
        })
      )
      .on("finish", () => {
        const rightJson = JSON.parse(
          fs.readFileSync(`${__dirname}/right.json`, { encoding: "utf8" })
        );
        const db = new sqlite3(`${__dirname}/output.db`);
        const outputJson = db.prepare("SELECT * FROM food").all();
        expect(outputJson).toEqual(rightJson);
      });
  });
});
