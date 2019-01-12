import { Transform } from "stream";
import { nodeCallback } from "./types";
/**
 * Show stream progress and time passed.
 */
export class ProgressStream extends Transform {
  private start?: number;
  private processed: number = 0;
  constructor(private size: number) {
    super();
  }

  public _transform(data: Buffer, encoding: string, callback: nodeCallback) {
    if (!this.start) {
      this.start = Date.now();
    }

    this.processed += data.length;
    const pers = Math.floor((this.processed * 100) / this.size);
    const deltaTime = Date.now() - this.start;
    const timePassed = Math.floor(deltaTime / 1000);
    const elapsedTime = Math.floor(
      this.calculatedElapsedTime(deltaTime) / 1000
    );
    console.log(
      `Progress: ${pers}%, time passed: ${timePassed}s, elapsedTime: ${elapsedTime}s`
    );
    callback(undefined, data);
  }

  public calculatedElapsedTime(deltaTime: number) {
    const sizeLeft = this.size - this.processed;
    return (sizeLeft / this.processed) * deltaTime;
  }
}
