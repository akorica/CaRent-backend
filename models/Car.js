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
    type: Number,
    required: true,
  },
  power: {
    type: String,
    required: true,
  },
  doors: {
    type: Number,
    required: true,
  },
  luggageCapacity: {
    type: Number,
    required: true,
  },
  airConditioning: {
    type: String,
    required: true,
  },
  fuel: {
    type: String,
    required: true,

    image,
  },
  country: {
    type: String,
    required: true,
    default: "",
  },
});

const Car = mongoose.model("car", carSchema);
export default User;
