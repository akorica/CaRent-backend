import mongoose from "mongoose";
const rentedSchema = new mongoose.Schema({
  carID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "car",
    required: true,
  },
  dateInfo: [
    {
      rentedFrom: {
        type: Date,
        required: true,
      },
      rentedUntil: {
        type: Date,
        required: true,
      },
    },
  ],
});

const Rented = mongoose.model("rented", rentedSchema);
export default Rented;
