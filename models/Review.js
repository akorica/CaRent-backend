import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  mark: {
    type: Number,
    required: true,
  },

  comment: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const Review = mongoose.model("review", reviewSchema);
export default Review;
