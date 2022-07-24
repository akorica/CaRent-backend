import express from "express";
import cors from "cors";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import User from "../models/User";
import Rents from "../models/Rents";
import Review from "../models/Review";
import Car from "../models/Car";
import Rented from "../models/Rented";
import dotenv from "dotenv";
import * as EmailValidator from "email-validator";
import bcrypt, { decodeBase64 } from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config({ path: __dirname + "/../.env" });
import nodemailer from "nodemailer";

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected"))
  .catch((error) => console.log(error));

const app = express();
app.use(cors());
app.use(express.json({ extended: false }));
const port = 8000;

const verify = (req, res, next) => {
  try {
    let authorization = req.headers.authorization.split(" ");
    let token = authorization[0];
    console.log(" TU SMO ", token);

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(400).json({ msg: "Unauthorised" });
  }
};

app.post("/user/register", async (req, res) => {
  const { name, surname, password, email, age } = req.body;

  if (!name || !surname || !password || !email || !age) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (!EmailValidator.validate(email)) {
    return res.status(400).json({ msg: "Invalidate email" });
  }
  if (password.length < 7) {
    return res.status(400).json({ msg: "Password is too short" });
  }
  if (age < 18) {
    return res.status(400).json({ msg: "User is too young" });
  }

  try {
    let userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ msg: "Email exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    userFound = new User({
      name,
      surname,
      password: hashedPassword,
      email,
      age,
    });
    await userFound.save();

    userFound = userFound.toJSON();
    delete userFound.password;

    let token = jwt.sign(
      userFound,
      process.env.JWT_SECRET,
      { expiresIn: "1 day" },
      (error, token) => {
        if (error) throw error;
        console.log(token);
        res.json({ token });
      }
    );
    console.log(token);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

app.get("/auth", [verify], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }

    let passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }
    user = user.toJSON();
    delete user.password;

    let token = jwt.sign(
      user,
      process.env.JWT_SECRET,
      { expiresIn: "1 day" },
      (error, token) => {
        if (error) throw error;
        console.log(token);
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.post("/user/update", [verify], async (req, res) => {
  const { newName, newSurname, newAdress, newPostalCode, newCity, newCountry } =
    req.body;

  try {
    let user = await User.findOne({ email: req.user.email });
    if (newName) user.name = newName;
    if (newSurname) user.surname = newSurname;
    if (newAdress) user.adress = newAdress;
    if (newPostalCode) user.postalCode = newPostalCode;
    if (newCity) user.city = newCity;
    if (newCountry) user.country = newCountry;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.delete("/user/delete", [verify], async (req, res) => {
  await User.deleteOne({ email: req.user.email });

  await Review.deleteMany({ email: req.user.email });
  res.status(200).send();
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carent.help@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/contact", (req, res) => {
  const { from, subject, text } = req.body;

  const combined_text = "<b> Email: </b>" + from + "<br>" + text;

  const mailOptions = {
    from: from,
    to: "carent.help@gmail.com",
    subject: subject,
    html: combined_text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).json({ msg: "Server Error" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send();
    }
  });
});

app.post("/car/add", async (req, res) => {
  console.log(req.body);
  const {
    make,
    name,
    bodyType,
    seats,
    power,
    doors,
    luggageCapacity,
    fuel,
    imageURL,
    driverLicenseCategory,
    productionYear,
    location,
    price,
    transmission,
  } = req.body;
  if (
    !make ||
    !name ||
    !bodyType ||
    !seats ||
    !power ||
    !doors ||
    !luggageCapacity ||
    !fuel ||
    !imageURL ||
    !driverLicenseCategory ||
    !productionYear ||
    !location ||
    !price ||
    !transmission
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    let newCar = new Car({
      make,
      name,
      bodyType,
      seats,
      power,
      doors,
      luggageCapacity,
      fuel,
      imageURL,
      driverLicenseCategory,
      productionYear,
      location,
      price,
      transmission,
    });
    await newCar.save();
    console.log(newCar);
    if (newCar) {
      return res.status(200).json({ msg: "Car added", newCar });
    }
  } catch (error) {
    res.status(400).json({ msg: "Invalid data", data: req.body });
  }
});

app.post("/car", async (req, res) => {
  const {
    make,
    name,
    seats,
    power,
    doors,
    luggageCapacity,
    fuel,

    transmission,
    productionYear,
    driverLicenseCategory,
    price,
    location,
    bodyType,
    dateCheckOut,
    dateDropOff,
  } = req.body;
  try {
    let cars;
    let filter = {};
    if (
      !make &&
      !name &&
      !bodyType &&
      !seats &&
      !power &&
      !doors &&
      !luggageCapacity &&
      !fuel &&
      !driverLicenseCategory &&
      !productionYear &&
      !location &&
      !transmission &&
      !price
    ) {
      cars = await Car.find({}).sort("price");
    } else {
      if (location) filter.location = location;
      if (make) filter.make = make;
      if (name) filter.name = name;
      if (bodyType) filter.bodyType = bodyType;
      if (seats) filter.seats = seats;
      if (doors) filter.doors = doors;
      if (power) filter.power = power;
      if (luggageCapacity) filter.luggageCapacity = luggageCapacity;
      if (fuel) filter.fuel = fuel;
      if (transmission) filter.transmission = transmission;
      if (productionYear) filter.productionYear = productionYear;
      if (driverLicenseCategory)
        filter.driverLicenseCategory = driverLicenseCategory;
      if (price) filter.price = { $lte: price };

      cars = await Car.find(filter).sort("price");

      let unavailableCars = await Rented.find({
        $and: [
          { dateInfo: { $elemMatch: { rentedFrom: { $gte: dateCheckOut } } } },
          { dateInfo: { $elemMatch: { rentedUntil: { $lte: dateDropOff } } } },
        ],
      }).select("carID -_id");
      console.log(unavailableCars);

      cars = cars.filter((car) => {
        //some -> umjesto da ide kroz cijeli array, kad nađe prvi koji odg kriteriju vraća true
        if (unavailableCars.some((e) => e.carID == car._id)) {
          return false;
        }
        return true;
      });
    }

    res.send(cars);
  } catch (error) {
    console.log(error);
  }
});

app.post("/car/update/:id", [verify], async (req, res) => {
  const {
    newMake,
    newName,
    newSeats,
    newPower,
    newDoors,
    newLuggageCapacity,
    newBodyType,
    newFuel,
    newImgURL,
    newTransmission,
    newProductionYear,
    newDriverLicenseCategory,
    newPrice,
    newLocation,
  } = req.body;
  console.log(newMake,
    newName,
    newSeats)
  try {
    const id = req.params.id;
    let car = await Car.findOne({ _id: id });

    if (newMake) car.name = newName;
    if (newName) car.make = newMake;
    if (newSeats) car.seats = newSeats;
    if (newPower) car.power = newPower;
    if (newDoors) car.doors = newDoors;
    if (newLuggageCapacity) car.luggageCapacity = newLuggageCapacity;
    if (newFuel) car.fuel = newFuel;
    if (newImgURL) car.imageURL = newImgURL;
    if (newBodyType) car.bodyType = newBodyType;
    if (newTransmission) car.transmission = newTransmission;
    if (newProductionYear) car.productionYear = newProductionYear;
    if (newDriverLicenseCategory)
      car.driverLicenseCategory = newDriverLicenseCategory;
    if (newPrice) car.price = newPrice;
    if (newLocation) car.location = newLocation;
    console.log(car);
    await car.save();
    res.send(car);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.delete("/car/delete/:id", [verify], async (req, res) => {
  try {
    const id = req.params.id;
    await Car.deleteOne({ _id: id });
    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

app.post("/rent/updateReturnal", async (req, res) => {
  try {
    const { idUser, idCarInfo } = req.body;
    const updatedCar = await Rents.updateOne(
      { user: idUser, carInfo: { $elemMatch: { _id: idCarInfo } } },
      {
        $set: {
          "carInfo.$.hasReturned": true,
        },
      }
    );

    res.status(200).send(updatedCar);
  } catch (error) {
    console.log(error);
  }
});

app.get("/user/rent", [verify], async (req, res) => {
  try {
    const rent = await Rents.findOne({ user: req.user._id }).populate([
      "user",
      "carInfo.car",
    ]);
    res.send(rent);
  } catch (error) {
    console.log(error);
  }
});

app.get("/rent", [verify], async (req, res) => {
  try {
    const rent = await Rents.find({}).populate(["user", "carInfo.car"]);
    res.send(rent);
  } catch (error) {
    console.log(error);
  }
});

app.post("/rent", [verify], async (req, res) => {
  try {
    const {
      carId,
      location,
      checkOut,
      dropOff,
      Name,
      Surname,
      Email,
      Age,
      Adress,
      postalCode,
      City,
      Country,
      totalPrice,
    } = req.body;

    const user = req.user._id;
    const carInfo = [
      {
        car: carId,
        location,
        checkOut,
        dropOff,
        Name,
        Surname,
        Email,
        Age,
        Adress,
        postalCode,
        City,
        Country,
        totalPrice,
      },
    ];
    const rentExist = await Rents.findOne({ user });
    if (rentExist) {
      rentExist.carInfo.push({
        car: carId,
        location,
        checkOut,
        dropOff,
        Name,
        Surname,
        Email,
        Age,
        Adress,
        postalCode,
        City,
        Country,
        totalPrice,
      });
      await rentExist.save();
      res.send(rentExist);
    } else {
      const newRent = new Rents({ user, carInfo });
      await newRent.save();
      res.send(newRent);
    }
    const rentedExist = await Rented.findOne({ carID: carId });
    const dateInfo = [
      {
        rentedFrom: checkOut,
        rentedUntil: dropOff,
      },
    ];
    if (rentedExist) {
      rentedExist.dateInfo.push({
        rentedFrom: checkOut,
        rentedUntil: dropOff,
      });
      await rentedExist.save();
      //   return res.send(rentedExist);
    }
    const newRented = new Rented({ carID: carId, dateInfo });
    await newRented.save();
    //res.send(newRented);
  } catch (error) {
    console.log(error);
  }
});

app.get("/car/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let car = await Car.findOne({ _id: id });
    res.send(car);
    console.log(car);
  } catch (error) {
    console.log(error);
  }
});

app.get("/users", async (req, res) => {
  try {
    let users = await User.find({});
    res.send(users);
  } catch (error) {
    console.log(error);
  }
});

app.patch("/user/setAdmin/:email", [verify], async (req, res) => {
  try {
    const email = req.params.email;
    let user = await User.findOne({ email: email });
    user.isAdmin = true;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.patch("/user/revokeAdmin/:email", [verify], async (req, res) => {
  try {
    const email = req.params.email;
    let user = await User.findOne({ email: email });
    user.isAdmin = false;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.post("/review/add", async (req, res) => {
  const { name, surname, mark, comment, email } = req.body;

  if (!name || !surname || !mark || !comment || !email) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    let newReview = new Review({
      name,
      surname,
      mark,
      comment,
      email,
    });
    await newReview.save();
    console.log(newReview);
    if (newReview) {
      return res.status(200).json({ msg: "Review added", newReview });
    }
  } catch (error) {
    res.status(400).json({ msg: "Invalid data", data: req.body });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    let reviews = await Review.find({});
    res.send(reviews);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/review/delete/:id", [verify], async (req, res) => {
  try {
    const id = req.params.id;
    await Review.deleteOne({ _id: id });
    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

app.post("/rent/reports", async (req, res) => {
  try {
    const { dateRentsTo, dateRentsFrom } = req.body;
    console.log(req.body);
    let getRentsByDate = await Rents.find({
      $and: [
        { carInfo: { $elemMatch: { checkOut: { $gte: dateRentsFrom } } } },
        { carInfo: { $elemMatch: { dropOff: { $lte: dateRentsTo } } } },
      ],
    }).populate(["user", "carInfo.car"]);
    const result = [];
    getRentsByDate.forEach((oneUser) => {
      oneUser.carInfo.forEach((oneRent) => {
        if (
          oneRent.checkOut >= new Date(dateRentsFrom) &&
          oneRent.dropOff <= new Date(dateRentsTo)
        )
          result.push(oneRent);
      });
    });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/rent/contact", (req, res) => {
  const {
    email,
    userName,
    userSurname,
    carName,
    carLocation,
    carMake,
    rentedFrom,
    rentedUntil,
  } = req.body;

  const combined_text =
    "<b>Thank you " +
    userName +
    " " +
    userSurname +
    " for your rent.</b>" +
    "<br>" +
    "<br>" +
    "<b>Rental information</b>" +
    "<br>" +
    "You have rented the following vehicle:" +
    carMake +
    " " +
    carName +
    "<br>" +
    "  You need to pick up the vehicle at " +
    carLocation +
    " and return it there." +
    "<br>" +
    "The vehicle can be collected from: " +
    rentedFrom +
    "<br>" +
    "The vehicle must be returned by: " +
    rentedUntil +
    "<br>" +
    "<br>" +
    "If there are any difficulties, we will contact you at: " +
    email +
    "<br>" +
    "<br>" +
    "Have a nice trip!" +
    "<br>" +
    "CaRent";

  const mailOptions = {
    from: "carent.help@gmail.com",
    to: email,
    subject: "CaRent - Rental information",
    html: combined_text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).json({ msg: "Server Error" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send();
    }
  });
});

app.listen(port, () => console.log(`SLUŠA ${port}`));
