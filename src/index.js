import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "../models/User";
import dotenv from "dotenv";
import * as EmailValidator from "email-validator";
dotenv.config({ path: __dirname + "/../.env" });

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connect"))
  .catch((error) => console.log(error));

const app = express();
app.use(cors());
app.use(express.json({ extended: false }));
const port = 8000;

app.post("/register", async (req, res) => {
  const { name, surname, password, email, age } = req.body;

  if (!name || !surname || !password || !email || !age) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (EmailValidator.validate(email)) {
    return res.status(400).json({ msg: "Invalidate email" });
  }

  let userFound = await User.findOne({ email });
  if (userFound) {
    return res.status(400).json({ msg: "Email exist" });
  }
  if (password.length < 7) {
    return res.status(400).json({ msg: "Password is too short" });
  }
  if (age < 18) {
    return res.status(400).json({ msg: "User is too young" });
  }

  userFound = new User({ name, surname, password, email, age });
  await userFound.save();
  res.send(req.body);
});

app.listen(port, () => console.log(`SLUŠA ${port}`));
