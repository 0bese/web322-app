const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];

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

async function initialize() {
  try {
    setData.forEach((set) => {
      const theme = themeData.find((theme) => theme.id === set.theme_id);
      const updatedSet = { ...set };
      if (theme) {
        updatedSet.theme = theme.name;
      } else {
        updatedSet.theme = "unknown";
      }

      sets.push(updatedSet);
    });
  } catch (err) {
    throw err;
  }
}

async function getAllSets() {
  try {
    return sets;
  } catch (err) {
    throw err;
  }
}

async function getSetByNum(setNum) {
  try {
    const foundSet = sets.find((set) => set.set_num === setNum);
    if (foundSet) {
      return foundSet;
    } else {
      throw new Error("unable to find requested set");
    }
  } catch (err) {
    throw err;
  }
}

async function getSetsByTheme(theme) {
  try {
    const newSet = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (newSet.length > 0) {
      return newSet;
    } else {
      throw new Error("unable to find requested sets");
    }
  } catch (err) {
    throw err;
  }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
//console.log(getAllSets());
//console.log(getSetByNum("001-1"));

//console.log(getSetsByTheme("TECH"))

//console.log(sets.length)
