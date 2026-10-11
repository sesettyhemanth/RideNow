const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
  },
  { _id: false }
);

module.exports = imageSchema;
