import { Transform } from "stream";
import { IParsedObject, nodeCallback } from "./types";

export class ObjectToJsonStream extends Transform {
  private isFirstChunk: boolean = true;
  constructor() {
    super({ objectMode: true });
  }

  public _transform(
    chunk: IParsedObject[],
    encoding: string,
    callback: nodeCallback
  ): void {
    let json = chunk.map(x => `,${JSON.stringify(x)}`).join("");

    if (this.isFirstChunk) {
      json = "[" + json.slice(1);
      this.isFirstChunk = false;
    }

    this.push(json);
    callback();
  }

  public _flush(callback: nodeCallback) {
    this.push("]");
    callback();
  }
}
