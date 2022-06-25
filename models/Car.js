import mongoose from "mongoose";
const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bodyType: {
    type: String,
    required: true,
  },
  places: {
    type: String,
    required: true,
  },
  power: {
    type: String,
    required: true,
  },
  doors: {
    type: String,
    required: true,
  },
  luggageCapacity: {
    type: String,
    required: true,
  },

  fuel: {
    type: String,
    required: true,
  },
  transmission: {
    type: String,
    required: true,
  },

  price: {
    type: String,
    required: true,
  },
  productionYear: {
    type: String,
    required: true,
  },
  minDriversAge: {
    type: String,
    required: true,
  },
  currentStation: {
    type: String,
    required: true,
  },
  rentedFrom: {
    type: String,
    required: false,
  },
  rentedUntil: {
    type: String,
    required: false,
  },

  imageURL: {
    type: String,
    required: true,
    default: "",
  },
});

const Car = mongoose.model("car", carSchema);
export default Car;
