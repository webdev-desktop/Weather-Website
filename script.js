document.addEventListener("DOMContentLoaded", () => {
  const cityName = document.querySelector(".weather_city");
  const searchCity = document.querySelector(".city_name");
  const dateTime = document.querySelector(".weather_date_time");
  const liveTime = document.querySelector(".live_date_time");
  const container = document.querySelector(".container");

  const w_forecast = document.querySelector(".weather_forecast");
  const w_icon = document.querySelector(".weather_icon");
  const w_temperature = document.querySelector(".weather_temperature");
  const w_min = document.querySelector(".weather_min");
  const w_max = document.querySelector(".weather_max");
  const w_feelsLike = document.querySelector(".weather_feelsLike");
  const w_humidity = document.querySelector(".weather_humidity");
  const w_wind = document.querySelector(".weather_wind");
  const w_pressure = document.querySelector(".weather_pressure");

  let getCityName;

  const loader = document.getElementById("loader");

  // show loader
  const showLoader = () => {
    loader.style.display = "flex";
  };

  // hide loader
  const hideLoader = () => {
    loader.style.display = "none";
  };

  //* ✅ ONE TIME FORMAT (API + LIVE BOTH)
  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  //* ✅ LIVE CLOCK +
  setInterval(() => {
    const now = new Date();
    liveTime.innerHTML = `⏱ Now: ${formatTime(now)}`;
  }, 1000);

  //* UPDATED TIME SAME PLACE
  const startClock = (dt) => {
    const updated = new Date(dt * 1000);
    dateTime.innerHTML = `⏳ Updated: ${formatTime(updated)} <br>`;
  };

  //* Country
  const getCountryName = (code) =>
    new Intl.DisplayNames(["en"], { type: "region" }).of(code);

  //* API KEY
  const api = "d7ec3135" + "875b5deb" + "e3d2628a" + "90742f65";

  //* LocalStorage
  const getCity = () => {
    getCityName = JSON.parse(localStorage.getItem("City")) || ["Mumbai"];
    return getCityName[0];
  };

  //* UI Update
  const updateUI = (data) => {
    const { main, name, weather, wind, sys, dt } = data;

    cityName.innerHTML = `📍 ${name}, ${getCountryName(sys.country)}`;

    //* 🔥 ONE CLOCK CALL
    startClock(dt);
    //* ✅ LIVE CLOCK +

    const now = new Date();
    liveTime.innerHTML = `⏱ Now: ${formatTime(now)}`;

    setWeatherAnimation(weather[0].main);

    w_forecast.innerHTML = weather[0].main;
    w_icon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png">`;

    w_temperature.innerHTML = `${main.temp.toFixed()}°C`;
    w_min.innerHTML = `Min: ${main.temp_min.toFixed()}°C`;
    w_max.innerHTML = `Max: ${main.temp_max.toFixed()}°C`;

    w_feelsLike.innerHTML = `${main.feels_like.toFixed()}°C`;
    w_humidity.innerHTML = `${main.humidity}%`;
    w_wind.innerHTML = `${wind.speed} m/s`;
    w_pressure.innerHTML = `${main.pressure} hPa`;
  };

  //* Fetch
  const fetchWeather = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod !== 200) throw new Error("City not found");
    return data;
  };

  //* Load Weather
  const loadWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const data = await fetchWeather(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api}&units=metric`
          );

          updateUI(data);
        } catch {
          fetchDefault();
        }
      }, fetchDefault);
    } else {
      fetchDefault();
    }
  };

  // 🌈 Weather Animation Control
  const setWeatherAnimation = (type) => {
    container.classList.remove("rain", "cloud", "sun", "night");
    if (type.includes("Rain")) container.classList.add("rain");
    else if (type.includes("Cloud")) container.classList.add("cloud");
    else if (type.includes("Clear")) container.classList.add("sun");
    else container.classList.add("night");
  };

  //* Default
  const fetchDefault = async () => {
    try {
      showLoader();
      const data = await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${getCity()}&appid=${api}&units=metric`
      );
      updateUI(data);
    } catch {
      toast("City not found 😬");
    } finally {
      hideLoader();
    }
  };

  //* Search
  const addCityName = async (e) => {
    e.preventDefault();
    const value = searchCity.value.trim();
    if (!value) return;

    try {
      const data = await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${value}&appid=${api}&units=metric`
      );

      getCityName = [value];
      localStorage.setItem("City", JSON.stringify(getCityName));

      searchCity.value = "";
      updateUI(data);
    } catch {
      console.log(searchCity.value);
      toast(`${searchCity.value}\n❌ City not found`);
      searchCity.value = "";
    }
  };

  //* Toast
  const toast = (msg) => {
    const t = document.createElement("div");
    t.innerText = msg;
    t.className = "toastMsg";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
  };

  //* Enter key
  searchCity.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCityName(e);
  });

  //* INIT
  loadWeather();
});
