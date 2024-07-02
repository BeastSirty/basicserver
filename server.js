const express = require("express");
const axios = require("axios");
const geoip = require("geoip-lite");
require("dotenv").config();

const app = express();

async function getWeatherData(location) {
  const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=${location}`;

  const response = await axios.get(weatherApiUrl);
  return response.data;
}

async function getUserIP() {
  const request = await fetch(
    `https://ipinfo.io/json?token=${process.env.TOKEN}`
  );
  const jsonResponse = await request.json();
  return jsonResponse.ip;
}

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name;
  const clientIp = await getUserIP();
  const geo = geoip.lookup(clientIp);
  const location = `${geo.region}, ${geo.country}`;

  try {
    const weatherData = await getWeatherData(location);
    const temperature = weatherData.current.temp_c;
    res.json({
      Client_Ip: clientIp,
      location,
      message: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching weather data" });
    geoip.clear;
  }
});

// const port = process.env.PORT || 3000;
const port = 3000;

const start = async () => {
  try {
    app.listen(port, () => console.log(`Server is listening to ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
