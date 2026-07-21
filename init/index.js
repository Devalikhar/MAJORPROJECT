require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB");
  await initDB();
  mongoose.connection.close();
}

main().catch((err) => console.log(err));

const initDB = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("697f232b4ebe1cc99c428889"),
  }));

  await Listing.insertMany(initData.data);

  console.log("Data was initialized");
};