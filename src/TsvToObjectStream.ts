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
 * Transform stream from .tsv files to JSON object
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
    }
    this.parser = new TsvParser();
  }

  public _transform(
    chunk: Buffer,
    encoding: string,
    callback: nodeCallback
  ): void {
    // if user provide us encoding than use it
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
        this.parseColumns = false;
        this.parsedCounter += 1;
        console.log(`Found columns: ${this.columns.join(", ")}`);
      } else {
        callback(
          new Error(`Can't parse columns because didn't found first line`)
        );
      }
    }

    if (this.parseTypes) {
      const first = parsed[0];
      if (first) {
        this.types = first.map(x => this._guessType(x));
        this.parseTypes = false;
        console.log(`Found types: ${this.types.join(", ")}`);
      }
    }

    const objectsArray = parsed.map(item => {
      this.parsedCounter += 1;
      return this._stringArrayToObject(item);
    });

    this.push(objectsArray);
    callback();
  }

  public _flush(callback: nodeCallback) {
    const parserBuffer = this.parser.getBuffered();
    if (parserBuffer) {
      const parsed = this.parser.parseLine(parserBuffer);
      const obj = this._stringArrayToObject(parsed);
      this.push([obj]);
    }
    callback();
  }

  private _guessType(str: string): parsingTypes {
    const isNumber = /^-?\d+[\.\,]?\d*$/g;
    return isNumber.test(str) ? "number" : "string";
  }

  private _stringArrayToObject(stringArray: string[]): IParsedObject {
    const obj: IParsedObject = {};
    if (this.columns.length !== stringArray.length) {
      console.log(
        `Warning line ${this.parsedCounter}: I have ${
          this.columns.length
        } columns but line have ${stringArray.length} columns`
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
          console.log(
            `Warning line ${
              this.parsedCounter
            }: tried to convert "${item}" to number but recived NaN`
          );
        }
      }
      obj[header] = typedItem;
    });
    return obj;
  }
}
