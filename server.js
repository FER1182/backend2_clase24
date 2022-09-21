/*============================[Modulos]============================*/
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import exphbs from "express-handlebars";
import path from "path";
import User from "./src/models/User.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import "./src/db/config.js";

const LocalStrategy = Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) console.log(err);
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) console.log(err);
        if (isMatch) return done(null, user);
        return done(null, false);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByID(id);
  return done(null, user);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://fer231182:fer231182@cluster0.hod4gpe.mongodb.net/?retryWrites=true&w=majority",
      ttl: 600,
    }),
    secret: "coder",
    resave: "false",
    saveUninitialized: false,
  })
); */

const auth = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("http://localhost:3000/login");
};

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password, direccion } = req.body;
  User.findOne({ username }, async (err, user) => {
    if (err) console.log(err);
    if (user) res.render("register-error");
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 8);
      const newUser = new User({
        username,
        password: hashedPassword,
        direccion,
      });
      await newUser.save();
      res.redirect("/login");
    }
  });
});
app.get("/", auth, (req, res) => {
  res.render("main", {
    user: req.session.user,
  });
});

app.post("/login", (req, res) => {
  const username = req.body.user;
  if (username == "pepe") {
    req.session.user = username;
    res.redirect(200, "http://localhost:3000");
    return;
  }
  res.send("login error");
});

app.get("/logout", (req, res) => {
  res.render("logout", { user: req.session.user });
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "logout error", body: err });
    }
  });
  //setTimeout(function () {
  //    res.redirect("login");
  //  }, 200);
});

//configuarciones//

app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");

app.listen(3000, () => {
  console.log("server ok");
});
