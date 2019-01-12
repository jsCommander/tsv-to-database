import { Transform } from "stream";
import { IParsedObject, nodeCallback } from "./types";

export class TransformStream extends Transform {
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
