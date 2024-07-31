/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: KOJO ANYANE OBESE Student ID: 137653226 Date: JULY 04, 2024
 *
 *  Published URL: https://web322mylegoapp.vercel.app/
 *
 ********************************************************************************/
const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");
const authData = require("./modules/auth-service.js");
const app = express();
const clientSessions = require("client-sessions");

const API_PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "public")));
const year = new Date().getFullYear();
//set view for ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 15 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.seenyou) {
    res.redirect("/login");
  } else {
    next();
  }
}

legoData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(API_PORT, () => {
      console.log(`app listening on: ${API_PORT}`);
    });
  })
  .catch((err) => {
    console.log(`unable to start server: ${err}`);
  });

//authentication

app.get("/login", async (req, res) => {
  await res.render("login", {
    errorMessage: null,
    year: year,
  });
});

app.post("/login", async (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  try {
    const user = await authData.checkUser(req.body);
    if (user) {
      // Add user details to session
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    } else {
      res.render("login", {
        errorMessage: "Invalid username or password",
      });
    }
  } catch (err) {
    res.render("login", { errorMessage: err });
  }
});

app.get("/register", async (req, res) => {
  await res.render("register", {
    errorMessage: null,
    successMessage: null,
    year: year,
  });
});

// Route for handling user registration
app.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const newUser = await authData.registerUser(req.body);
    res.render("register", {
      successMessage: "User created",
      errorMessage: null,
    });
  } catch (err) {
    console.error(err);
    res.render("register", {
      errorMessage: err,
      userName,
      successMessage: null,
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// Route for user history
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

//routes
app.get("/", ensureLogin, async (req, res) => {
  await res.render("home");
});

app.get("/about", ensureLogin, async (req, res) => {
  await res.render("about");
});

app.get("/lego/sets", ensureLogin, async (req, res) => {
  try {
    if (req.query.theme) {
      let sets = await legoData.getSetsByTheme(req.query.theme);
      res.render("sets", { legoSet: sets });
    } else {
      let sets = await legoData.getAllSets();
      res.render("sets", { legoSet: sets });
    }
  } catch (err) {
    res
      .status(404)
      .render("404", { message: "Unable to find requested sets." });
  }
});

app.get("/lego/sets/:num", ensureLogin, async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { legoSet: set });
  } catch (err) {
    res
      .status(404)
      .render("404", { message: "Unable to find requested sets." });
  }
});

// start

app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    let themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });
  } catch (err) {
    res.status(500).render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// POST route to handle form submission
app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { themes: themes, legoSet: set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// POST route to handle form submission for editing a set
app.post("/lego/editSet", ensureLogin, async (req, res) => {
  try {
    const setNum = req.body.set_num;
    const setData = {
      name: req.body.name,
      year: req.body.year,
      theme_id: req.body.theme_id,
      num_parts: req.body.num_parts,
      img_url: req.body.img_url,
    };
    await legoData.editSet(setNum, setData);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// end

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for.",
  });
});
