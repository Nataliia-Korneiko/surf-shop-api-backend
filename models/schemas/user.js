const { Schema } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Add user name'],
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = userSchema;
