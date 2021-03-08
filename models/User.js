const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email:   {type:String, required:true, unique:true},
    password:{type:String, required:true},
    date:    {type:String, default:Date.now}
})

module.exports = User = mongoose.model('user', UserSchema)