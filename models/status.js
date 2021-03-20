const mongoose = require("mongoose");
const { Schema } = mongoose;

const statusSchema = new Schema({
  status: String,
});

module.exports = mongoose.model("Status", statusSchema);
