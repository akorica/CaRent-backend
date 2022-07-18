import mongoose from "mongoose";
const rentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },

  carInfo: [
    {
      car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true,
      },
      hasReturned: {
        type: Boolean,
        default: false,
        required: true
      },
      location: {
        type: String,
        required: true,
      },
      checkOut: {
        type: Date,
        required: true,
      },
      dropOff: {
        type: Date,
        required: true,
      },
      Name: {
        type: String,
        required: true,
      },
      Surname: {
        type: String,
        required: true,
      },
      Email: {
        type: String,
        required: true,
      },
      Age: {
        type: Number,
        required: true,
      },
      Adress: {
        type: String,
        required: true,
      },
      postalCode: {
        type: Number,
        required: true,
      },
      City: {
        type: String,
        required: true,
      },
      Country: {
        type: String,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      }
    },
  ],
});

const Rents = mongoose.model("Rents", rentSchema);
export default Rents;
