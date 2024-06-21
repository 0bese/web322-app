/********************************************************************************
 *  WEB322 – Assignment 03
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: KOJO ANYANE OBESE Student ID: 137653226 Date: JUNE 06, 2024
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
//route
app.get("/", async (req, res) => {
  await res.sendFile(path.join(__dirname, "views", "/home.html"));
});

app.get("/about", async (req, res) => {
  await res.sendFile(path.join(__dirname, "views", "about.html"));
});

//GET LEGO SETS
app.get("/lego/sets", async (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.initialize().then(() => {
      legoData
        .getSetsByTheme(theme)
        .then((sets) => {
          res.send(sets);
        })
        .catch((err) => {
          res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
        });
    });
  } else {
    legoData.initialize().then(() => {
      legoData.getAllSets().then((sets) => {
        res.send(sets);
      });
    });
  }
});

//GET LEGO SETS NUM-DEMO
app.get("/lego/sets/:set_num", async (req, res) => {
  legoData.initialize().then(() => {
    legoData
      .getSetByNum(req.params.set_num)
      .then((sets) => {
        res.send(sets);
      })
      .catch((err) => {
        res.send(err);
      });
  });
});

// //GET LEGO SETS THEME-DEMO
// app.get("/lego/sets/theme-demo", async (req, res) => {
//   const demoTheme = "town";

//   try {
//     const set = await legoData.getSetsByTheme(demoTheme);
//     res.json(set);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

//SERVER RUNNING
app.listen(API_PORT, () => {
  console.log(`Server running on port ${API_PORT}`);
});
