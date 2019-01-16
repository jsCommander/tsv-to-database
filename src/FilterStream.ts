import { Transform } from "stream";
import { IParsedObject, nodeCallback } from "./types";
/**
 * This class can filter stream. Only objects that pass filter function will be piped to next stream
 *
 * @export
 * @class FilterStream
 * @extends {Transform}
 */
export class FilterStream extends Transform {
  /**
   * Creates an instance of FilterStream.
   * @param filter function that will be used to filter stream
   * @memberof FilterStream
   */
  constructor(private filter: (object: IParsedObject) => boolean) {
    super({ objectMode: true });
  }

  public _transform(
    chunk: IParsedObject[],
    encoding: string,
    callback: nodeCallback
  ) {
    if (!Array.isArray(chunk)) {
      callback(
        new Error(
          `Filter stream can't procces ${typeof chunk} input. It works works only with arrays of objects`
        )
      );
    }
    const filtered = chunk.filter(x => this.filter(x));
    this.push(filtered);
    callback();
  }
}
