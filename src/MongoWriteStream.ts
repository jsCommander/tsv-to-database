import { Db, InsertWriteOpResult, MongoClient } from "mongodb";
import { Writable } from "stream";
import { IParsedObject, nodeCallback } from "./types";

interface IMongoStreamOptions {
  databaseUrl?: string;
  databaseName?: string;
  collectionName?: string;
}
/**
 *  This class can write stream in mongoDB database
 *
 * @export
 * @class MongoWriteStream
 * @extends {Writable}
 */
export class MongoWriteStream extends Writable {
  private databaseName: string = "tsv_to_mongo";
  private collectionName: string = "parsed_tsv";
  private databaseUrl: string = "mongodb://localhost:27017";
  private db: Promise<Db>;
  private client: Promise<MongoClient>;
  private lastInsert?: Promise<void | InsertWriteOpResult>;

  constructor(options?: IMongoStreamOptions) {
    super({ objectMode: true });
    if (options) {
      const { databaseName, databaseUrl, collectionName } = options;
      if (databaseName) {
        this.databaseName = databaseName;
      }
      if (databaseUrl) {
        this.databaseUrl = databaseUrl;
      }
      if (collectionName) {
        this.collectionName = collectionName;
      }
    }
    this.client = new MongoClient(this.databaseUrl, {
      useNewUrlParser: true
    }).connect();
    this.db = this.client.then(client => client.db(this.databaseName));
  }

  public _write(
    chunk: IParsedObject[],
    encoding: string,
    callback: nodeCallback
  ): void {
    const insertPromice = this.db
      .then(db => {
        const collection = db.collection(this.collectionName);
        return collection.insertMany(chunk);
      })
      .catch(err => {
        console.log(err);
        process.exit();
      });

    this.lastInsert = this.lastInsert
      ? (this.lastInsert = this.lastInsert.then(() => insertPromice))
      : (this.lastInsert = insertPromice);
    callback();
  }

  public _final(callback: nodeCallback) {
    if (this.lastInsert) {
      this.lastInsert.then(() => {
        this.client.then(client => client.close());
      });
    }
    callback();
  }
}
