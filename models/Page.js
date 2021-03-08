const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
    user:{ // we take id from the user schema connecting them
        type: Schema.Types.ObjectId,
        ref:'users'
    },
    pageName: {
        type: String,
        unique:true
    },
    shareLink: {
        //Add here the firebase deeplink
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }  
})

module.exports = Page = mongoose.model('page', PageSchema)