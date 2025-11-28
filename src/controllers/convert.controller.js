const { processCSV, ageReport } = require("../services/csv.service");

exports.convertCSV = async (req, res) => {
  try {
    const filePath = process.env.CSV_FILE_PATH;

    const count = await processCSV(filePath);

    console.log("Inserted records:", count);

    await ageReport();

    res.json({
      message: "CSV processed successfully",
      totalRecords: count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};