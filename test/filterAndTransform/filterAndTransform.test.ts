import fs from "fs";
import {
  FilterStream,
  ObjectToJsonStream,
  TransformStream,
  TsvToObjectStream
} from "../../src/index";

describe("convert tsv to json with filter and transform", () => {
  it("shoud correctly apply filter and transform function to stream", () => {
    const tsvFilePath = `${__dirname}/input.tsv`;

    fs.createReadStream(tsvFilePath)
      .pipe(new TsvToObjectStream())
      .pipe(new FilterStream(x => x["Fat_(g)"] < 30))
      .pipe(
        new TransformStream(x => {
          if (typeof x.Food === "string") {
            const arr = x.Food.split(",");
            x.Food = arr.slice(0, 2).join(" ");
          }
          return x;
        })
      )
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
