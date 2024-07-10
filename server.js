/********************************************************************************
 *  WEB322 – Assignment 04
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
const app = express();

const API_PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "public")));
//set view for ejs
app.set("view engine", "ejs");

//routes

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
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

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { legoSet: set });
  } catch (err) {
    res
      .status(404)
      .render("404", { message: "Unable to find requested sets." });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for.",
  });
});

legoData.initialize().then(() => {
  app.listen(API_PORT, () => {
    console.log(`server running on port ${API_PORT}`);
  });
});
