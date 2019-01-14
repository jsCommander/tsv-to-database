/**
 *
 *
 * @export
 * @class TsvParser
 */
export class TsvParser {
  private lineCounter: number = 0;
  private lineBuffer?: string;
  constructor(
    private rowSeparator: string = "\t",
    private lineSeparator: string = "\n"
  ) {}
  /**
   *
   *
   * @param {string} str
   * @returns {string[][]}
   * @memberof TsvParser
   */
  public parseTextToLines(str: string): string[][] {
    const lines = str.split(this.lineSeparator);
    if (this.lineBuffer) {
      lines[0] = this.lineBuffer + lines[0];
    }
    // add last line to buffer
    const lastLine = lines.pop();
    this.lineBuffer = lastLine;
    this.lineCounter += lines.length;
    return lines.map(line => this.parseLine(line));
  }

  get counter() {
    return this.lineCounter;
  }
  /**
   *
   *
   * @returns {(string | undefined)}
   * @memberof TsvParser
   */
  public getBuffered(): string | undefined {
    return this.lineBuffer;
  }
  /**
   *
   *
   * @param {string} line
   * @returns {string[]}
   * @memberof TsvParser
   */
  public parseLine(line: string): string[] {
    const cols = line.split(this.rowSeparator);
    return cols;
  }
  /**
   *
   *
   * @param {string} str
   * @returns {string}
   * @memberof TsvParser
   */
  public sanitizeString(str: string): string {
    return str.replace(/\s+/g, "_");
  }
}
