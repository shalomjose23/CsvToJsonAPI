const fs = require("fs");
const readline = require("readline");
const setNested = require("./nestedObject");

async function parseCSV(filePath) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream });

  let headers = [];
  const records = [];

  for await (const line of rl) {
    const values = line.split(",").map((v) => v.trim());

    if (headers.length === 0) {
      headers = values;
      continue;
    }

    const obj = {};
    values.forEach((val, i) => {
      setNested(obj, headers[i], val);
    });

    records.push(obj);
  }

  return records;
}

module.exports = parseCSV;