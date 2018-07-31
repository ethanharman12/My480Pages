var weatherApp = (function ()
{
    var storedLocation = null;
    var weatherApiKey = "b5ff74d71f025608f36b58174edda7fa";
    var elevationApiKey = "AIzaSyChIZjQhKaKiwh1dwHCZ4hudqUklO5i7y8";

    function ClearError()
    {
        var errorMessageContainer = document.getElementById("errorMessageContainer");
        errorMessageContainer.style.display = "none";

        var timeText = document.getElementById("errorTime");
        timeText.innerText = "";

        var errorText = document.getElementById("errorMessage");
        errorText.innerText = "";
    }

    function DisplayAltitude(altitude)
    {
        var altBox = document.getElementById("yourAltBox");
        var altText = document.getElementById("yourAlt");

        altText.innerText = altitude;
        altBox.style.height = altitude/3 + "px";

        var avgBox = document.getElementById("avgAltBox");
        var avgText = document.getElementById("avgAlt");

        avgText.innerText = 760;
        avgBox.style.height = 760/3+"px";
    }

    function DisplayDistance(location)
    {
        if (typeof (Storage) != undefined)
        {
            if (localStorage.lat && localStorage.long)
            {
                //calc
                if (typeof (Worker) != undefined)
                {
                    var distCalc = new Worker("../WebWorkers/DistanceCalculator.js");

                    distCalc.postMessage({
                        origLat: localStorage.lat,
                        origLong: localStorage.long,
                        newLat: location.coords.latitude,
                        newLong: location.coords.longitude
                    });

                    distCalc.onmessage = function (results)
                    {
                        var distText = document.getElementById("distanceText");
                        distText.innerText = results.data.toFixed(2);

                        $("#distanceDiv").show();
                        //var distBox = document.getElementById("distanceDiv");
                        //distBox.hidden = false;

                        distCalc.terminate();
                    };
                }
            }
            else
            {
                localStorage.lat = location.coords.latitude;
                localStorage.long = location.coords.longitude;
            }
        }
    }

    function DisplayError(errorMessage)
    {
        var errorMessageContainer = document.getElementById("errorMessageContainer");
        errorMessageContainer.style.display = "flex";

        var timeText = document.getElementById("errorTime");
        timeText.innerText = new Date().toLocaleString();

        var errorText = document.getElementById("errorMessage");
        errorText.innerText = errorMessage;
    }

    function DisplayLocation(location)
    {
        var long = document.getElementById("longitude");
        var lat = document.getElementById("latitude");

        long.innerText = location.coords.longitude;
        lat.innerText = location.coords.latitude;
    }

    function DisplayForecast(forecast) {

        var currentDate = new Date().getDate();
        var todaysForecast = forecast[0];
        var hourlyIndex = 0;

        while (todaysForecast.time.getDate() == currentDate && hourlyIndex < 5) {
            var weather = todaysForecast;
            var timeText = document.getElementById("time0" + hourlyIndex);
            timeText.innerText = moment(weather.time).format("MM/DD/YYYY hh:mm:ss");

            var tempText = document.getElementById("temp0" + hourlyIndex);
            tempText.innerText = weather.tempMin + " - " + weather.tempMax;

            var humidText = document.getElementById("humid0" + hourlyIndex);
            humidText.innerText = weather.humidity;

            var weatherText = document.getElementById("weather0" + hourlyIndex);
            weatherText.innerText = weather.weather;

            var box = document.getElementById('weatherBox0' + hourlyIndex);
            box.classList.add('finished');

            setTimeout(function () {
                box.classList.remove('finished');
            }, 1000);

            hourlyIndex++;
            todaysForecast = forecast[hourlyIndex];
        }

        for (var i = hourlyIndex; i < 5; i++) {
            var box = document.getElementById('weatherBox0' + i);
            box.style.display = "none";
        }

        var i = 0;
        var dayIndex = 0;        
        var tomorrowsDate = new Date();
        tomorrowsDate.setDate(currentDate + 1)

        while (i < 5 && dayIndex < forecast.length) {
            var dayForecast = forecast[dayIndex];
            dayIndex++;

            if (dayForecast.time.getDate() == tomorrowsDate.getDate()) {
                tomorrowsDate.setDate(tomorrowsDate.getDate() + 1)

                var weather = dayForecast;
                var timeText = document.getElementById("time" + i);
                timeText.innerText = moment(weather.time).format("ddd MM/DD/YYYY");

                var tempText = document.getElementById("temp" + i);
                tempText.innerText = weather.tempMin + " - " + weather.tempMax;

                var humidText = document.getElementById("humid" + i);
                humidText.innerText = weather.humidity;

                var weatherText = document.getElementById("weather" + i);
                weatherText.innerText = weather.weather;

                var box = document.getElementById('weatherBox' + i);
                box.classList.add('finished');

                setTimeout(function () {
                    box.classList.remove('finished');
                }, 1000);

                i++;
            }
        }
    }

    function DisplayWeather(weather)
    {
        var timeText = document.getElementById("time");
        timeText.innerText = moment(weather.time).format("MM/DD/YYYY hh:mm:ss");

        var tempText = document.getElementById("temp");
        tempText.innerText = weather.temperature;

        var humidText = document.getElementById("humid");
        humidText.innerText = weather.humidity;

        var weatherText = document.getElementById("weather");
        weatherText.innerText = weather.weather;

        var box = document.getElementById('weatherBox');
        box.classList.add('finished');

        setTimeout(function ()
        {
            box.classList.remove('finished');
        }, 1000);
    }

    function FetchElevation(location)
    {
        var url = "https://maps.googleapis.com/maps/api/elevation/json?locations=" + location.coords.latitude +
            "," + location.coords.longitude +
            "&key=" + elevationApiKey;

        var yqlURL = [
            "https://query.yahooapis.com/v1/public/yql",
            "?q=" + encodeURIComponent("select * from json where url='" + url + "'"),
            "&format=json&callback=?"
        ].join("");

        var promise = new Promise(function (resolve, reject) {
            $.getJSON(yqlURL, function (data) {
                try {
                    var elevation = Number(data.query.results.json.results.elevation);

                    resolve(elevation);
                }
                catch (e) {
                    reject(e);
                }
            });
        });

        return promise;
    }

    function FetchForecast(location) {
        var url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + location.coords.latitude +
            "&lon=" + location.coords.longitude +
            "&appid=" + weatherApiKey +
            "&units=imperial";

        var promise = new Promise(function (resolve, reject) {
            $.getJSON(url, function (data) {
                try {
                    var weatherObj = ParseForecast(data);

                    resolve(weatherObj);
                }
                catch (e) {
                    reject(e);
                }
            });
        });

        return promise;
    }

    function FetchWeather(location)
    {
        var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + location.coords.latitude +
            "&lon=" + location.coords.longitude +
            "&appid=" + weatherApiKey +
            "&units=imperial";

        var promise = new Promise(function (resolve, reject)
        {
            $.getJSON(url, function (data)
            {
                try
                {
                    var weatherObj = ParseWeather(data);

                    resolve(weatherObj);
                }
                catch (e)
                {
                    reject(e);
                }
            });
        });

        return promise;
    }

    function GetElevation(location)
    {
        location = location || storedLocation;

        FetchElevation(location)
        .then(
        function (elevation)
        {
            if (location.coords.altitude)
            {
                DisplayAltitude(location.coords.altitude);
            }
            else
            {
                DisplayAltitude(elevation);
            }

            ShowUpdateButton();
        },
        function (error)
        {
            DisplayError(error);
            ShowUpdateButton();
        });
    }

    function GetForecast(location) {
        location = location || storedLocation;

        FetchForecast(location)
            .then(
            function (weather) {
                ClearError();
                DisplayForecast(weather);                
            },
            function (error) {
                DisplayError(error);
                ShowUpdateButton();
            });
    }

    function GetLocation()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(ProcessLocation);
        }
    };

    function GetWeather(location)
    {
        location = location || storedLocation;

        FetchWeather(location)
        .then(
        function (weather)
        {
            ClearError();
            DisplayWeather(weather);
            
            ShowUpdateButton();
        },
        function (error)
        {
            DisplayError(error);
            ShowUpdateButton();
        });
    }

    function ParseForecast(data) {
        var days = [];

        for (var i = 0; i < data.list.length; i++) {
            var dayData = data.list[i];

            var date = new Date(dayData.dt_txt);

            var tempMin = Math.round(dayData.main.temp_min);
            var tempMax = Math.round(dayData.main.temp_max);

            var humidity = Math.round(dayData.main.humidity);

            var weather = dayData.weather[0].main + " - " + dayData.weather[0].description;

            days.push({
                time: date,
                tempMin: tempMin,
                tempMax: tempMax,
                humidity: humidity,
                weather: weather
            });
        }        

        return days;
    }

    function ParseWeather(data) {
        
        var temp = Math.round(data.main.temp);
        
        var humidity = Math.round(data.main.humidity);

        var weather = data.weather[0].main + " - " + data.weather[0].description;        

        return {
            time: new Date(),
            temperature: temp,
            humidity: humidity,
            weather: weather
        };
    }

    function ProcessLocation(location)
    {
        storedLocation = location;

        DisplayLocation(location);
        DisplayDistance(location);
        GetWeather(location);
        GetForecast(location);
        GetElevation(location);
    }

    function ShowUpdateButton()
    {
        var btn = document.getElementById("updateWeatherBtn");
        btn.hidden = false;
        var btn = document.getElementById("toggleForecastBtn");
        btn.hidden = false;
    }

    function ToggleForecast() {
        var btn = document.getElementById("toggleForecastBtn");
        var forecastDiv = document.getElementById("forecastContainer");
        if (btn.innerText == "Show Forecast") {
            btn.innerText = "Hide Forecast";
            forecastDiv.style.display = "block";
        }
        else {
            btn.innerText = "Show Forecast";
            forecastDiv.style.display = "none";
        }
    }

    return {
        DisplayAltitude: DisplayAltitude,
        DisplayDistance: DisplayDistance,
        DisplayLocation: DisplayLocation,
        DisplayWeather: DisplayWeather,
        GetLocation: GetLocation,
        GetWeather: GetWeather,
        ParseWeather: ParseWeather,
        ToggleForecast: ToggleForecast
    };
})();

weatherApp.GetLocation();