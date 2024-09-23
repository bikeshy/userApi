const mongoose = require("mongoose")
//schema
var userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token:{
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        required: true
    },
    // role: {
    //     type: String,
    //     enum: ['Admin', 'user', 'Visitor']
    // }
});

const User = mongoose.model('user', userSchema);

module.exports = User;