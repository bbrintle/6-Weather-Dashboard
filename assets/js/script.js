var fahrenheit, humidity, windSpeed, log, lat, uvURL, newCityObject, cityName;

var cityInput = $("#city-input");
var searchBtn = document.getElementById("searchBtn");
var currentCityArray = [];


function pullAPI(cityName){
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + '&appid=07a5be9b6278338d5fd01e132774742f';

    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
            newCityObject = getLocationWeatherData(response);
            return newCityObject;
        });
};

function pull5DayAPI(cityName){
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=07a5be9b6278338d5fd01e132774742f";
    var numOfForecastBoxes = 0;
    clear5DayForecast();

    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
            
            for (var i = 0; numOfForecastBoxes < 5; i += 8){
                var newForecastDiv = $("<div>");
                var daysOut = response.list[i].dt_txt.slice(0,10);
                var getDate = daysOut.slice(5, -3) + "/" + daysOut.slice(8) + "/" + daysOut.slice(0,4);
                var dateElement = $("<h5>");
                dateElement.text(getDate);

                var weatherDescription = response.list[i].weather[0].description;
                var descriptionTag = $("<p>");
                descriptionTag.text(weatherDescription);

                var forecastTemp = calcFahrenheit(response.list[i].main.temp);
                var forecastTempTag = $("<p>");
                forecastTempTag.text("Temp: " + forecastTemp + " °F");

                var forecastHumid = response.list[i].main.humidity;
                var forecastHumidTag = $("<p>");
                forecastHumidTag.text("Humidity: " + forecastHumid + "%");
                

                newForecastDiv.append(dateElement);
                newForecastDiv.append(descriptionTag);
                newForecastDiv.append(forecastTempTag);
                newForecastDiv.append(forecastHumidTag);

                newForecastDiv.attr("class", "forecast-box");
                $("#display-forecast").append(newForecastDiv);
                numOfForecastBoxes++
            }   
        });
};

function calcFahrenheit(kelvinTemp){
    return ((kelvinTemp - 273.15) * (9/5) + 32).toFixed(2);
};

function clear5DayForecast(){
    $("#display-forecast").empty();
};

function clearSearchInput(){
    cityInput.val("");
};

function clearUVIndex(){
    $('#display-uv-index').empty();
    $('#display-uv-index').text("UV Index:")
};

function getLocationWeatherData(element){
    fahrenheit = calcFahrenheit(element.main.temp);
    humidity = element.main.humidity;
    windSpeed = element.wind.speed + " MPH";
    log = element.coord.lon;
    lat = element.coord.lat;
    cityName = element.name;

    var cityObject = {
        cityName: cityName,
        fahrenheit: fahrenheit,
        humidity: humidity,
        windSpeed: windSpeed,
        log: log,
        lat: lat
    }
    displayWeatherInfo(cityObject);
    clearSearchInput();
};

function displayWeatherInfo(cityObject){
    clearUVIndex()

    var cityText = $('#city-text');
    cityText.text(cityObject.cityName + " (" +  moment().format('MM/DD/YYYY') + ")");

    var displayTemp = $('#display-temp');
    displayTemp.text("Tempreature: " + cityObject.fahrenheit + " °F");

    var displayHumid = $('#display-humidity');
    displayHumid.text("Humidity: " + cityObject.humidity);

    var displayWindSpeed= $('#display-wind-speed');
    displayWindSpeed.text("Wind Speed: " + cityObject.windSpeed);

    uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityObject.lat + "&lon=" + cityObject.log + "&appid=07a5be9b6278338d5fd01e132774742f";
    $.ajax({
        url: uvIndexURL,
        method: "GET"
        }).then(function(response) {
            var uvDiv = $('<div>');
            uvDiv.text(response.value)
            
            if(response.value > 0 && response.value <= 2){ uvDiv.attr("class", 'bckColorGreen uv-box') };
            if(response.value > 2 && response.value <= 4){ uvDiv.attr("class", 'bckColorYellow uv-box') };
            if(response.value > 4 && response.value <= 6){ uvDiv.attr("class", 'bckColorOrange uv-box') }; 
            if(response.value > 6 && response.value <= 9){ uvDiv.attr("class", 'bckColorRed uv-box') };
            if(response.value > 9){ uvDiv.attr("class", 'bckColorPink uv-box') };

            $('#display-uv-index').append(uvDiv);
        });

}

searchBtn.addEventListener('click', function() {
    if(cityInput.val()){
        if(currentCityArray.indexOf(cityInput.val().toLowerCase()) !== -1){
            //do nothing because it is already on the list.
        }else {
            
            currentCityArray.push(cityInput.val().toLowerCase());
            var newCityDiv = document.createElement('div');
            newCityDiv.textContent = cityInput.val();
            newCityDiv.classList.add('city-box');
            $("#city-list").append(newCityDiv);

            //call the API infromation using the city name from input/box value
            pullAPI(cityInput.val())
            pull5DayAPI(cityInput.val())
        }
    }else{
        //do nothing
    }
});

$("#city-list").on("click", function(event){
    event.preventDefault();
    var targetClicked = event.target;
    var cityClicked = targetClicked.textContent;
    pullAPI(cityClicked);
    pull5DayAPI(cityClicked);
});