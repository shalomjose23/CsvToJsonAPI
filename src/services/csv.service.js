const pool = require("../config/db");
const parseCSV = require("../utils/csvParser");

async function processCSV(filePath) {
  const rows = await parseCSV(filePath);

  const batchSize = 500;
  let batch = [];

  for (const row of rows) {
    const first = row?.name?.firstName || "";
    const last = row?.name?.lastName || "";

    const fullName = `${first} ${last}`.trim();
    const age = Number(row.age);

    const address = row.address ? row.address : null;

    const cleanRow = structuredClone(row);
    delete cleanRow.name;
    delete cleanRow.age;
    delete cleanRow.address;

    const additionalInfo = Object.keys(cleanRow).length > 0 ? cleanRow : null;

    batch.push({
      name: fullName,
      age,
      address,
      additionalInfo,
    });

    if (batch.length === batchSize) {
      await insertBatch(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
  }

  return rows.length;
}

async function insertBatch(batch) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const query =
      "INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)";

    for (const row of batch) {
      await client.query(query, [
        row.name,
        row.age,
        row.address,
        row.additionalInfo,
      ]);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function ageReport() {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE age < 20) AS below20,
      COUNT(*) FILTER (WHERE age >= 20 AND age < 40) AS between20_40,
      COUNT(*) FILTER (WHERE age >= 40 AND age < 60) AS between40_60,
      COUNT(*) FILTER (WHERE age >= 60) AS above60,
      COUNT(*) AS total
    FROM users;
  `;

  const { rows } = await pool.query(query);
  const r = rows[0];

  console.log("\nAge-Group    % Distribution");
  console.log("<20           ", ((r.below20 / r.total) * 100).toFixed(2));
  console.log("20-40         ", ((r.between20_40 / r.total) * 100).toFixed(2));
  console.log("40-60         ", ((r.between40_60 / r.total) * 100).toFixed(2));
  console.log(">60           ", ((r.above60 / r.total) * 100).toFixed(2));
}

module.exports = { processCSV, ageReport };