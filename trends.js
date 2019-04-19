/* trends.js file */
/*  \users POST request financial spending data
    \trends GET request to simply see the data that's been input */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser:true} );
mongoose.set('useCreateIndex', true);

var TrendSchema = new Schema({
    userID: {type: mongoose.Types.ObjectId, required: true},
    data: [{
        amount: {type: Number, required: true},
        category: {type: String, enum:["Recreation", "Nutrition", "Gift"]},
        date: {type: Date, required: true},
    }]
});

var Trend = mongoose.model('Trend',TrendSchema);

module.exports = mongoose.model('Trend', TrendSchema);