/* trends.js file */
/*  \users POST request financial spending data
    \trends GET request to simply see the data that's been input */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser:true} );
mongoose.set('useCreateIndex', true);

var SpendSchema = new Schema({
    amount: {type: Number, required: true},
    category: {type: {String, enum}},
    date: Date,
})


var TrendSchema = new Schema({
    data: [{ type: Schema.Types.ObjectId, ref: 'Spend'}]
})

var Spend = mongoose.model('Spend',SpendSchema);
var Trend = mongoose.model('Trend',TrendSchema);

/* Measurement of financial information. */
/*
    amount: string,enum
    category: (choose from list)
    Date: Date
*/
