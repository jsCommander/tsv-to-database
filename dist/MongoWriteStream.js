"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const stream_1 = require("stream");
/**
 *  This class can write stream in mongoDB database
 *
 * @export
 * @class MongoWriteStream
 * @extends {Writable}
 */
class MongoWriteStream extends stream_1.Writable {
    constructor(options) {
        super({ objectMode: true });
        this.databaseName = "tsv_to_mongo";
        this.collectionName = "parsed_tsv";
        this.databaseUrl = "mongodb://localhost:27017";
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
        this.client = new mongodb_1.MongoClient(this.databaseUrl, {
            useNewUrlParser: true
        }).connect();
        this.db = this.client.then(client => client.db(this.databaseName));
    }
    _write(chunk, encoding, callback) {
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
    _final(callback) {
        if (this.lastInsert) {
            this.lastInsert.then(() => {
                this.client.then(client => client.close());
            });
        }
        callback();
    }
}
exports.MongoWriteStream = MongoWriteStream;
//# sourceMappingURL=MongoWriteStream.js.map