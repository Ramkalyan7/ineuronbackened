import express from "express";
import mongoose from "mongoose";
import cors from "cors";

//app config
const app = express();

//middlewares
app.use(express.json());

app.use(cors());

//db config and listen
const CONNECTION_URL =
  "mongodb+srv://admin:xIhP6m8Amso4bOQQ@cluster0.ditbab3.mongodb.net/?retryWrites=true&w=majority";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server Running on Port:http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect to database`));

//   schemas

const MeetingSchema = mongoose.Schema({
  adminId: String,
  title: String,
  message: String,
  date: String,
  startTime: String,
  endTime: String,
  users: [
    {
      type: String,
    },
  ],
});

//xIhP6m8Amso4bOQQ
const UserSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const RegisterSchema = mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  notes: String,
});

const User = mongoose.model("User", UserSchema);
const Register = mongoose.model("Register", RegisterSchema);
const Meeting = mongoose.model("/registermeet", MeetingSchema);

app.post("/register", async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (user) {
    return res.status(400).send("That user already exisits!");
  } else {
    // Insert the new user if they do not exist yet
    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    await user.save();
    res.json(user);
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  const passwordIsValid = req.body.password === user.password;
  if (!passwordIsValid) {
    return res.status(401).send({ message: "Invalid Password!" });
  }

  res.status(200).send({
    username: user.username,
    email: user.email,
    userId: user._id,
  });
  console.log(user);
});

app.get("/", (req, res) => {
  res.json("hello");
});

app.post("/createmeet", async (req, res) => {
  const meet = new Meeting({
    adminId: req.body.adminId,
    title: req.body.title,
    message: req.body.message,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    users: [],
  });
  await meet.save();
  res.json(meet);
});

app.post("/registermeet", async (req, res) => {
  const register = new Register({
    userId: req.body.userId,
    name: req.body.name,
    email: req.body.email,
    notes: req.body.notes,
  });

  let mdl;

  await Meeting.findByIdAndUpdate(
    req.body.meetId,
    { $push: { users: req.body.username } },
    { safe: true, upsert: true, new: true },
    async (err, model) => {
      if (err) {
        return res.json(err);
      }

      mdl = model;
    }
  ).clone();

  await register.save();
  res.status(200).json(mdl);
});

app.get("/meets/:adminId", async (req, res) => {
  Meeting.find({ adminId: req.params.adminId }, (err, meetings) => {
    if (err) {
      return res.json(err);
    }

    res.json(meetings);
  });
});

app.get("/users/:meetId", async (req, res) => {
  Meeting.findById(req.params.meetId, async (err, meet) => {
    if (err) console.log(err);
    res.json(meet);
  });
});

app.get("/userprofile/:username", async (req, res) => {
  User.findOne({ username: req.params.username }, async (err, user) => {
    if (err) console.log(err);
    res.json(user);
  });
});

app.get("/allusers", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// get all admins get all meetings of admin
//getRegisteredUsers and getAdmin->meetings
