import { Transform } from "stream";
import { IParsedObject, nodeCallback } from "./types";
/**
 * This class can transform all objects in stream.
 *
 * @export
 * @class TransformStream
 * @extends {Transform}
 */
export class TransformStream extends Transform {
  /**
   * Creates an instance of TransformStream.
   * @param transform function that transform object to another object
   * @memberof TransformStream
   */
  constructor(private transform: (object: IParsedObject) => IParsedObject) {
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
          `Transform stream can't procces ${typeof chunk} input. It works works only with arrays of objects`
        )
      );
    }
    const transformed = chunk.map(x => this.transform(x));
    this.push(transformed);
    callback();
  }
}
