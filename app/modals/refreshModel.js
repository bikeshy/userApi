const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
    token: {
        type: String, // Single token field
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Refrace', refreshSchema);
