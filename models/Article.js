//Require mongoose
var mongoose = require("mongoose");
var Note = require("./Note");

//Saving a reference to the Schema constructor
var Schema = mongoose.Schema;

//Creating new UserSchema Object
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

//Export the Article Model
module.exports = Article;