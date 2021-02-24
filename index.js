const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const { isLoggedIn } = require("./middleware");

mongoose.connect("mongodb://localhost/projek1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("database connected");
});

const sessionConfig = {
  secret: "thisiswhatwecalledsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("landing");
});
app.get("/home", isLoggedIn, (req, res) => {
  res.render("home");
});
app.get("/register", (req, res) => {
  const Month = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  res.render("signup", { Month });
});
app.post("/register", async (req, res) => {
  try {
    const { username, password, bulan, tanggal, tahun } = req.body;
    const user = new User({ username, bulan, tanggal, tahun });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.redirect("/home");
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/register");
  }
});
app.get("/login", (req, res) => {
  res.render("signin");
});
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/home");
  }
);
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("listening on port: 3000");
});
