import { Transform } from "stream";
import { TsvParser } from "./TsvParser";
import { IParsedObject, nodeCallback } from "./types";

type parsingTypes = "number" | "string";
interface ITsvToObjectStreamOptions {
  stringEncoding?: string;
  ignoreFirstLine?: boolean;
  lineSeparator?: string;
  rowSeparator?: string;
  columns?: string[];
  types?: parsingTypes[];
}
/**
 * This class can make objects from byte stream
 *
 * @export
 * @class TsvToObjectStream
 * @extends {Transform}
 */
export class TsvToObjectStream extends Transform {
  private parsedCounter: number = 0;
  private parseColumns: boolean = true;
  private parseTypes: boolean = true;
  private columns: string[] = [];
  private types: parsingTypes[] = [];
  private ignoreFirstLine: boolean = false;
  private stringEncoding: string = "utf-8";
  private parser: TsvParser;

  constructor(options?: ITsvToObjectStreamOptions) {
    super({ objectMode: true });

    if (options) {
      const {
        lineSeparator,
        rowSeparator,
        stringEncoding,
        columns,
        types,
        ignoreFirstLine
      } = options;
      this.parser = new TsvParser(rowSeparator, lineSeparator);
      if (stringEncoding) {
        this.stringEncoding = stringEncoding;
      }
      if (ignoreFirstLine) {
        this.ignoreFirstLine = ignoreFirstLine;
      }
      if (columns) {
        if (Array.isArray(columns)) {
          this.columns = columns;
          this.parseColumns = false;
        } else {
          throw new Error(
            `Columns must be array of strings but recive ${typeof columns}`
          );
        }
      }
      if (types) {
        if (Array.isArray(types)) {
          this.types = types;
          this.parseTypes = false;
        } else {
          throw new Error(
            `Types must be array of strings but recive ${typeof types}`
          );
        }
      }
    } else {
      this.parser = new TsvParser();
    }
  }

  public _transform(
    chunk: Buffer,
    encoding: string,
    callback: nodeCallback
  ): void {
    const enc = encoding === "buffer" ? this.stringEncoding : encoding;
    const str = chunk.toString(enc);

    const parsed = this.parser.parseTextToLines(str);
    if (this.ignoreFirstLine) {
      parsed.shift();
      this.parsedCounter += 1;
    }

    if (this.parseColumns) {
      const first = parsed.shift();
      if (first) {
        this.columns = first.map(x => this.parser.sanitizeString(x));
        if (this.columns.length === 1) {
          callback(
            new Error(
              `Can't parse columns, found only one column. Check rowSeparator.`
            )
          );
        }
        this.parseColumns = false;
        this.parsedCounter += 1;
        console.log(
          `Found ${this.columns.length} columns: ${this.columns.join(", ")}`
        );
      } else {
        callback(
          new Error(
            `Can't parse columns because didn't found first line. Check lineSeparator.`
          )
        );
      }
    }

    if (this.parseTypes) {
      const first = parsed[0];
      if (first) {
        this.types = first.map(x => this._guessType(x));
        this.parseTypes = false;
        console.log(
          `Found ${this.types.length} types: ${this.types.join(", ")}`
        );
      }
    }

    const objectsArray = parsed.map(item => {
      this.parsedCounter += 1;
      return this._stringArrayToObject(item, callback);
    });

    this.push(objectsArray);
    callback();
  }

  public _flush(callback: nodeCallback) {
    const parserBuffer = this.parser.getBuffered();
    if (parserBuffer) {
      const parsed = this.parser.parseLine(parserBuffer);
      const obj = this._stringArrayToObject(parsed, callback);
      this.push([obj]);
    }
    callback();
  }

  private _guessType(str: string): parsingTypes {
    const isNumber = /^-?\d+[\.\,]?\d*$/g;
    return isNumber.test(str) ? "number" : "string";
  }

  private _stringArrayToObject(
    stringArray: string[],
    callback: nodeCallback
  ): IParsedObject {
    const obj: IParsedObject = {};

    if (stringArray.length !== this.columns.length) {
      const str = stringArray.length > this.columns.length ? "more" : "less";
      console.error(
        `Error at line ${
          this.parsedCounter
        }: line have ${str} columns then expected. Expected: ${
          this.columns.length
        }, found: ${stringArray.length}`
      );
    }

    stringArray.forEach((item, index) => {
      let typedItem: string | number | boolean = item;
      let header = this.columns[index];
      if (!header) {
        header = `column_${index + 1}`;
      }
      const type = this.types[index];
      if (type === "number") {
        const parsed = parseFloat(item.replace(",", "."));
        if (!isNaN(parsed)) {
          typedItem = parsed;
        } else {
          this.types[index] = "string";
          console.error(
            `Error at line ${
              this.parsedCounter
            }: tried to convert "${item}" to number but recived NaN. Changing type for string`
          );
        }
      }
      obj[header] = typedItem;
    });
    return obj;
  }
}
