var citiesData = null;
var statesData = null;
const downloadCities = () => {
  return fetch("../Data/cities.json")
    .then((resp) => resp.json())
    .then((data) => data);
};
const downloadStates = () => {
  return fetch("../Data/states.json")
    .then((resp) => resp.json())
    .then((data) => data);
};

const downloadData = async () => {
  const cities = await downloadCities();
  const states = await downloadStates();
  citiesData = cities;
  statesData = states;
};

downloadData();

var skycons = new Skycons({ color: "white" });
skycons.add("weather-icon", Skycons.PARTLY_CLOUDY_DAY);
skycons.play();

const setSkycons = (id, iconCode) => {
  const isDay = iconCode.slice(-1) === "d";
  const code = iconCode.slice(0, 2);

  if (code === "11" || code === "09" || code === "10") {
    skycons.set("weather-icon", Skycons.RAIN);
  } else if (code === "13") {
    if (id === "611" || id === "612" || id === "613") {
      skycons.set("weather-icon", Skycons.SLEET);
    } else {
      skycons.set("weather-icon", Skycons.SNOW);
    }
  } else if (code === "50") {
    if (id === "741") {
      skycons.set("weather-icon", Skycons.FOG);
    } else {
      skycons.set("weather-icon", Skycons.WIND);
    }
  } else if (code === "01") {
    if (isDay) {
      skycons.set("weather-icon", Skycons.CLEAR_DAY);
    } else {
      skycons.set("weather-icon", Skycons.CLEAR_NIGHT);
    }
  } else if (code === "02" || code === "03") {
    if (isDay) {
      skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_DAY);
    } else {
      skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_NIGHT);
    }
  } else if (code === "04") {
    skycons.set("weather-icon", Skycons.CLOUDY);
  } else {
    if (isDay) {
      skycons.set("weather-icon", Skycons.CLEAR_DAY);
    } else {
      skycons.set("weather-icon", Skycons.CLEAR_NIGHT);
    }
  }
};

const locationContainer = document.getElementById("location-container");
const locationSelector = document.getElementById("location-selector");
const locationInput = document.getElementById("location-input");
const btnfindMe = document.getElementById("img-location");

const tempNum = document.getElementById("temp-num");
const tempSymbol = document.getElementById("temp-symbol");
const weatherDescription = document.getElementById("weather-description");
const flagImage = document.getElementById("img-flag");
const locationName = document.getElementById("location-name");

const tempFeelsLike = document.getElementById("temp-fl");
const tempMax = document.getElementById("temp-max");
const tempMin = document.getElementById("temp-min");
const weatherPressure = document.getElementById("weather-pressure");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherVisibility = document.getElementById("weather-visibility");
const weatherWindSpeed = document.getElementById("weather-wind-speed");
const weatherWindDegree = document.getElementById("weather-wind-degree");

const locationSuggestion = document.getElementById("location-suggestion");

var weather;

const countryFlagUrl = (countryCode) => {
  return `https://assets.ipstack.com/flags/${countryCode.toLowerCase()}.svg`;
};

const ipFinderApi = () => {
  return "https://api.ipify.org";
};
const ipLocationApi = (ipString) => {
  return `../api/ip_location.php?ip=${ipString}`;
};
const weatherApi = (cityName) => {
  const APIKey = "89abe4f04842396e66baf7a1783e43a0";
  return `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}&units=metric`;
};
const weatherApiGeo = (lat, lon) => {
  const APIKey = "89abe4f04842396e66baf7a1783e43a0";
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`;
};

const updateWeather = () => {
  const pWeather = weather.weather[0];
  tempNum.innerHTML = weather.main.temp;
  weatherDescription.innerHTML = pWeather.main + " | " + pWeather.description;
  const cc = weather.sys.country;
  flagImage.src = `https://assets.ipstack.com/flags/${cc.toLowerCase()}.svg`;
  locationName.innerHTML = weather.name + ", " + cc;
  setSkycons(pWeather.id, pWeather.icon);

  tempFeelsLike.innerHTML = weather.main.feels_like;
  tempMin.innerHTML = weather.main.temp_min;
  tempMax.innerHTML = weather.main.temp_max;
  weatherPressure.innerHTML = weather.main.pressure;
  weatherHumidity.innerHTML = weather.main.humidity;
  weatherVisibility.innerHTML = weather.visibility;
  weatherWindSpeed.innerHTML = weather.wind.speed;
  weatherWindDegree.innerHTML = weather.wind.deg;
};

const updateLocation = (lat, lon) => {
  const dataArrivalHandler = (data) => {
    if (data.cod === "404") {
      locationInputErrorAnimation();
      return;
    }
    weather = data;
    updateWeather();
    hideLocationInput();
  };

  if (!lat || !lon) {
    locationInputErrorAnimation();
  } else {
    fetch(weatherApiGeo(lat, lon))
      .then((resp) => resp.json())
      .then(dataArrivalHandler);
  }
};

const locationInputErrorAnimation = () => {
  const defaultColor = locationInput.style.borderColor;
  locationInput.style.borderColor = "red";
  setTimeout(() => {
    locationInput.style.borderColor = defaultColor;
  }, 500);
};
const showLocationInput = () => {
  locationContainer.style.display = "none";
  locationSelector.style.display = "unset";
  locationInput.value = "";
  locationInput.focus();
};

const hideLocationInput = () => {
  locationContainer.style.display = "flex";
  locationSelector.style.display = "none";
  locationSuggestion.innerHTML = "";
};

locationContainer.onclick = () => {
  showLocationInput();
};

locationInput.onkeydown = (e) => {
  if (e.key === "Escape") {
    hideLocationInput();
  }
};

const findMe = async () => {
  const ipString = await fetch(ipFinderApi()).then((resp) => resp.text());
  const jsonResponse = await fetch(ipLocationApi(ipString)).then((resp) =>
    resp.json()
  );
  return jsonResponse;
};

btnfindMe.onclick = (e) => {
  findMe().then((location) => {
    updateLocation(location.lat, location.lon);
  });
};

const getStateById = (id) => {
  return statesData.find((state) => state.id === id);
};

const locationItemEventHandler = (target) => {
  const cityId = +target.getAttribute("data-city-id");
  const cityItem = citiesData.find((city) => city.id === cityId);
  const stateItem = getStateById(cityItem.state_id);
  updateLocation(cityItem.latitude, cityItem.longitude);
};

const updateLocationSearchSuggestion = (suggestions) => {
  const createLocationItem = (item) => {
    const { id, country_code, name, state_id, latitude, longitude } = item;
    const state_name = getStateById(state_id).name;
    return `<div class="location-item" data-city-id="${id}" onclick="locationItemEventHandler(this)">
    <img src="${countryFlagUrl(country_code)}" alt="flag">
    <span>${name}, ${state_name}, ${country_code}</br><span class="location-cords">@ ${latitude} , ${longitude}</span></span>
  </div>`;
  };
  const elements = suggestions.map((item) => createLocationItem(item)).join("");
  locationSuggestion.innerHTML = elements;
};

const serachInCities = (str) => {
  const temp = str.split("");
  temp[0] = temp[0].toUpperCase();
  str = temp.join("");
  const result = [];
  for (let i = 0; i < citiesData.length; i++) {
    if (result.length === 5) break;
    if (citiesData[i].name === str) {
      result.push(citiesData[i]);
    }
  }
  for (let i = 0; i < citiesData.length; i++) {
    if (result.length === 5) break;
    if (citiesData[i].name.includes(str)) {
      if (!result.includes(citiesData[i])) {
        result.push(citiesData[i]);
      }
    }
  }
  return result;
};

var searcher = null;
var isSearchInCitiesDumpAllowed = false;

locationInput.onkeyup = () => {
  const str = locationInput.value;
  if (citiesData == null || str.length < 2) return;
  if (searcher != null) {
    clearTimeout(searcher);
  }
  searcher = setTimeout(() => {
    const suggestedCities = serachInCities(str);
    updateLocationSearchSuggestion(suggestedCities);
    searcher = null;
  }, 500);
};

findMe().then((location) => {
  updateLocation(location.lat, location.lon);
});
