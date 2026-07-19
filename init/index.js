const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
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