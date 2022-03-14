var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var ActorSchema = require('./Actors').schema

mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);


var MovieSchema = new Schema({
    title: String,
    year: String,
    genre: String,
    actors: [ActorSchema]
});

module.exports = mongoose.model('Movie', MovieSchema);