const mongoose = require('mongoose');
const { Schema }=mongoose;

mongoose.connect(`mongodb+srv://divyamrauthan002:access123@cluster0.f4zllst.mongodb.net/data`);

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true},
});

const flightSchema = new Schema({
    airline: { type: String, required: true },
    flightNo: { type: String, required: true },
    departure: { type: String, required: true},
    arrival: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true},
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
})

const bookingSchema = new Schema({
    title: { type: String},
    user: { type: ObjectId, ref:'User'},
    flight: { type: ObjectId, ref:'Flight'},
});
  
const Usermodel = mongoose.model("User", userSchema);
const Flightmodel = mongoose.model("Flight", flightSchema);
const Bookingmodel = mongoose.model("Booking", bookingSchema);

  
module.exports = { connection, Usermodel, Flightmodel, Bookingmodel };
  