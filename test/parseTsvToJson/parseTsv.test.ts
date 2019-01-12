import fs from "fs";
import { ObjectToJsonStream, TsvToObjectStream } from "../../src/index";

describe("convert tsv to json", () => {
  it("shoud correctly parse tsv file and convert it to json format", () => {
    const tsvFilePath = `${__dirname}/input.tsv`;

    fs.createReadStream(tsvFilePath)
      .pipe(new TsvToObjectStream())
      .pipe(new ObjectToJsonStream())
      .pipe(fs.createWriteStream(`${__dirname}/output.json`))
      .on("finish", () => {
        const outputJson = JSON.parse(
          fs.readFileSync(`${__dirname}/output.json`, { encoding: "utf8" })
        );
        const rightJson = JSON.parse(
          fs.readFileSync(`${__dirname}/right.json`, { encoding: "utf8" })
        );
        expect(outputJson).toEqual(rightJson);
      });
  });
});
