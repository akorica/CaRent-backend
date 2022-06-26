import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,

  },
  carInfo: [{
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "car",
    required: true,
  },
  checkOutLocation: {
    type: String,
    required: true,
  },
  dropOffLocation: {
    type: String,
    required: true,
  },
  checkOut: {
     type: Date ,
     required: true
  },
  dropOff: { 
    type: Date,
    required: true
  },
  
}]
  
});

const Rents = mongoose.model("Rents", userSchema);
export default Rents;
