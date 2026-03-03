const express = require("express");
const { getWeather } = require("../services/weatherService");

const router = express.Router();

router.get("/:city", async (req, res, next) => {
  try {
    const city = String(req.params.city);
    const data = await getWeather(city);
    res.json(data);
  } catch (e) {
    if (e.response?.status === 404) {
      res.status(404);
      return next(new Error("City not found"));
    }
    return next(e);
  }
});

module.exports = router;
