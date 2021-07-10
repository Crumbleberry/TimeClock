const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeCheckSchema = new Schema({
    clockType: {
        type: String,
        required: true
    },
    clockTime: {
        type: Date,
        required: true
    },
    clockUser: {
        type: Number,
        required: true
    }
},{timestamps: true});

const TimeCheck = mongoose.model('TimeCheck',timeCheckSchema);

module.exports = TimeCheck;