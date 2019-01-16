import { Transform } from "stream";
import { nodeCallback } from "./types";

/**
 *
 *
 * @export
 * @class ProgressStream
 * @extends {Transform}
 */
export class ProgressStream extends Transform {
  private start?: number;
  private processed: number = 0;
  private nextLog: number;
  private barTemplate =
    "Progress: %d% %d/%d MB, time passed:%ds eta:%ds, heap: %dMB, rss: %dMB";

  constructor(private size: number, private logEvery: number = 10) {
    super();
    this.nextLog = logEvery;
  }

  public _transform(chunk: Buffer, encoding: string, callback: nodeCallback) {
    if (!this.start) {
      this.start = Date.now();
    }

    this.processed += chunk.length;
    const percent = Math.floor((this.processed * 100) / this.size);

    if (percent > this.nextLog) {
      const deltaTime = Date.now() - this.start;
      const timePassed = Math.floor(deltaTime / 1000);
      const eta = this._calculateElapsedTime(deltaTime);
      const mem = process.memoryUsage();
      const usedHeap = this._byteToMB(mem.heapUsed);
      const rss = this._byteToMB(mem.rss);

      console.log(
        this.barTemplate,
        percent,
        this._byteToMB(this.processed),
        this._byteToMB(this.size),
        timePassed,
        eta,
        usedHeap,
        rss
      );
      this.nextLog = percent + this.logEvery;
    }

    callback(undefined, chunk);
  }

  private _calculateElapsedTime(deltaTime: number): number {
    const sizeLeft = this.size - this.processed;
    return Math.floor(((sizeLeft / this.processed) * deltaTime) / 1000);
  }

  private _byteToMB(byte: number): number {
    const mb = byte / 1024 / 1024;
    return Math.floor(mb);
  }
}
