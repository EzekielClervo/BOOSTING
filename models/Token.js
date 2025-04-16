// models/Token.js
const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  accessToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', TokenSchema);
