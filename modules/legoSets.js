require("dotenv").config();
const Sequelize = require("sequelize");

const setData = require("../data/setData");
const themeData = require("../data/themeData");

//stucture
// themeData = {
//     "id": "686",
//     "name": "Chinese Traditional Festivals"
// },
// setData =  {
//     "set_num": "0003977811-1",
//     "name": "Ninjago: Book of Adventures",
//     "year": "2022",
//     "theme_id": "761",
//     "num_parts": "1",
//     "img_url": "https://cdn.rebrickable.com/media/sets/0003977811-1.jpg"
// },

const { DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  define: {
    timestamps: false,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

const Theme = sequelize.define("Theme", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

//Set model (table)
const Set = sequelize.define("Set", {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});

//creating association between two models(tables)
Set.belongsTo(Theme, { foreignKey: "theme_id" });

async function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        // try {
        //   await Theme.bulkCreate(themeData);
        // await Set.bulkCreate(setData);
        // resolve();
        // } catch (error) {
        //   console.error("could not sync ",error)
        // }
        console.log("Database synchronized successfully.");
        resolve();
      })
      .catch((err) => {
        console.error("Unable to synchronize database:", err);
        reject(err);
      });
  });
}

async function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((sets) => {
        resolve(sets);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findOne({
      include: [Theme],
      where: { set_num: setNum },
    })
      .then((foundSet) => {
        if (foundSet) {
          resolve(foundSet);
        } else {
          reject(new Error("Unable to find requested set"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((foundSets) => {
        if (foundSets.length > 0) {
          resolve(foundSets);
        } else {
          reject(new Error("Unable to find requested sets"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => {
        resolve(themes);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num: set_num } })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({ where: { set_num: set_num } })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
  Set,
  Theme,
};
//console.log(getAllSets());
//console.log(getSetByNum("001-1"));

//console.log(getSetsByTheme("TECH"))

//console.log(sets.length)
