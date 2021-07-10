const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    userType: {
        type: Number,
        required: true
    }
},{timestamps: true});

const User = mongoose.model('User',UserSchema);

module.exports = User;