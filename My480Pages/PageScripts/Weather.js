var weatherApp = (function ()
{
    var storedLocation = null;

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
    };

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
    };

    function DisplayLocation(location)
    {
        var long = document.getElementById("longitude");
        var lat = document.getElementById("latitude");

        long.innerText = location.coords.longitude;
        lat.innerText = location.coords.latitude;
    };

    function DisplayWeather(weather)
    {
        var timeText = document.getElementById("time");
        timeText.innerText = weather.time.toString();

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
    };

    function FetchWeather(location)
    {
        var url = "http://forecast.weather.gov/MapClick.php?lat=" + location.coords.latitude +
                  "&lon=" + location.coords.longitude + "&FcstType=dwml";

        var yqlURL = [
            "http://query.yahooapis.com/v1/public/yql",
            "?q=" + encodeURIComponent("select * from xml where url='" + url + "'"),
            "&format=xml&callback=?"
        ].join("");

        var promise = new Promise(function (resolve, reject)
        {
            $.getJSON(yqlURL, function (data)
            {
                try
                {
                    xmlContent = $(data.results[0]);

                    var weatherObj = ParseWeather(xmlContent);

                    resolve(weatherObj);
                }
                catch (e)
                {
                    reject(e);
                }
            });
        });

        return promise;

        //var request = new XMLHttpRequest();

        //request.open("GET", "http://forecast.weather.gov/MapClick.php?lat=40.147663200000004&lon=-82.9488296&FcstType=dwml");
        //request.withCredentials = true;
        //request.send();

        //var data = request.response;
        //var xml = request.responseXML;
    };

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
            DisplayWeather(weather);

            if (location.coords.altitude)
            {
                DisplayAltitude(location.coords.altitude);
            }
            else
            {
                DisplayAltitude(weather.altitude);
            }

            ShowUpdateButton();
        },
        function (error)
        {
            alert(error);//"Error fetching weather data: " +

            ShowUpdateButton();
        });
    }

    function ParseWeather(xmlContent)
    {
        var root = xmlContent[0];
        var datas = root.getElementsByTagName("data");

        var current = [].slice.call(datas).filter(function (i)
        {
            return i.getAttribute("type") == "current observations";
        });

        var paras = current[0].getElementsByTagName("parameters");
        var temps = paras[0].getElementsByTagName("temperature");

        var apparentTemp = [].slice.call(temps).filter(function (i)
        {
            return i.getAttribute("type") == "apparent";
        });

        //var temp = apparentTemp[0].childNodes[1].innerText;
        var temp = apparentTemp[0].children[0].innerText;

        //var humidity = paras[0].getElementsByTagName("humidity")[0].childNodes[1].innerText;
        var humidity = paras[0].getElementsByTagName("humidity")[0].children[0].innerText;

        var weatherDatas = paras[0].getElementsByTagName("weather")[0].getElementsByTagName("weather-conditions");
        var weatherDesc = [].slice.call(weatherDatas).filter(function (i)
        {
            return i.getAttribute("weather-summary") != null;
        });

        var weather = weatherDesc[0].getAttribute("weather-summary");

        var altitude = current[0].getElementsByTagName("location")[0]
                                 .getElementsByTagName("height")[0]
                                 .childNodes[0].nodeValue;

        var altMeters = Number(altitude) * .3048;

        return { time: new Date(), temperature: temp, humidity: humidity, weather: weather, altitude: altMeters };
    };

    function ProcessLocation(location)
    {
        storedLocation = location;

        DisplayLocation(location);
        DisplayDistance(location);
        GetWeather(location);
    };

    function ShowUpdateButton()
    {
        var btn = document.getElementById("updateWeatherBtn");
        btn.hidden = false;
    };

    return {
        DisplayAltitude: DisplayAltitude,
        DisplayDistance: DisplayDistance,
        DisplayLocation: DisplayLocation,
        DisplayWeather: DisplayWeather,
        GetLocation: GetLocation,
        GetWeather: GetWeather,
        ParseWeather: ParseWeather
    };
})();

weatherApp.GetLocation();