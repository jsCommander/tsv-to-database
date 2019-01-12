import { Transform } from "stream";
import { IParsedObject, nodeCallback } from "./types";

export class FilterStream extends Transform {
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
