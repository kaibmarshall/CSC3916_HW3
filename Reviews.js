var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

var ReviewSchema = new Schema({
    reviewerUsername: String,
    comment: String,
    rating: Number,
    movieID: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Review', ReviewSchema);