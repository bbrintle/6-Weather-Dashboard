var fahrenheit, humidity, windSpeed, log, lat, uvURL, newCityObject, cityName;
var cityInput = $("#city-input");
var searchBtn = document.getElementById("searchBtn");
var currentCityArray = [];

//pulls the current weather API
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

//pulls the 5-Day Forecast API
function pull5DayAPI(cityName){
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=07a5be9b6278338d5fd01e132774742f";
    var numOfForecastBoxes = 0;
    clear5DayForecast();

    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
            //list will post every 3 hours, need to loop every 8 to make it 1 full day rotation
            for (var i = 0; numOfForecastBoxes < 5; i += 8){
                //create the Forecast Div Box
                var newForecastDiv = $("<div>");

                //add the date to into the <h5> tag
                var daysOut = response.list[i].dt_txt.slice(0,10);
                var getDate = daysOut.slice(5, -3) + "/" + daysOut.slice(8) + "/" + daysOut.slice(0,4);
                var dateElement = $("<h5>");
                dateElement.text(getDate);

                //add the weather info into a <p> tag
                var descriptionTag = $("<img>");
                descriptionTag.attr('src', swapCodeForIcon(response.list[i].weather[0].icon));

                //add the temp info into a <p> tag
                var forecastTempTag = $("<p>");
                forecastTempTag.text("Temp: " + calcFahrenheit(response.list[i].main.temp) + " °F");

                //add the humidity info into a <p> tag
                var forecastHumidTag = $("<p>");
                forecastHumidTag.text("Humidity: " + response.list[i].main.humidity + "%");
                
                //append all the tags into the Forecast Div
                newForecastDiv.append(dateElement, descriptionTag, forecastTempTag, forecastHumidTag);

                //assign class forecast-box from the css file then append to HTML
                newForecastDiv.attr("class", "forecast-box");
                $("#display-forecast").append(newForecastDiv);

                //once this process completes, add 1 to numOfForecastBoxes
                //once thise variable reaches 5, the for loop stops and you are provided with 
                //a 5 box - 5 day forecast
                numOfForecastBoxes++
            }   
        });
};

function swapCodeForIcon(iconCode){
    myURL = "http://openweathermap.org/img/wn/" + iconCode + ".png";
    return myURL;
};

//simple function to convert Kelvin into Fahrenheit
function calcFahrenheit(kelvinTemp){
    return ((kelvinTemp - 273.15) * (9/5) + 32).toFixed(2);
};

//clears everything from the 5-Day Forecast area
function clear5DayForecast(){
    $("#display-forecast").empty();
};

//clears anything in the Input bar
function clearSearchInput(){
    cityInput.val("");
};

//clears the UV Index box from site
function clearUVIndex(){
    $('#display-uv-index').empty();
    $('#display-uv-index').text("UV Index:")
};

//sets the values of current weather based on provided city. put all the value into an object, displays the weather info onto website
function getLocationWeatherData(element){
    fahrenheit = calcFahrenheit(element.main.temp);
    humidity = element.main.humidity;
    windSpeed = element.wind.speed + " MPH";
    log = element.coord.lon;
    lat = element.coord.lat;
    cityName = element.name;

    //save all the info from the API into an object to make it easier to send to other functions
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

//this function will display the waether information based on the information it has been provided from the API
function displayWeatherInfo(cityObject){
    //before collecting and displaying the new UV Index box, wipe the old one clear first
    clearUVIndex()

    //set city name
    var cityText = $('#city-text');
    cityText.text(cityObject.cityName + " (" +  moment().format('MM/DD/YYYY') + ")");

    //set city temp
    var displayTemp = $('#display-temp');
    displayTemp.text("Tempreature: " + cityObject.fahrenheit + " °F");

    //set city humidity
    var displayHumid = $('#display-humidity');
    displayHumid.text("Humidity: " + cityObject.humidity + "%");

    //set city wind speed
    var displayWindSpeed= $('#display-wind-speed');
    displayWindSpeed.text("Wind Speed: " + cityObject.windSpeed);

    //pull the UV Index API
    uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityObject.lat + "&lon=" + cityObject.log + "&appid=07a5be9b6278338d5fd01e132774742f";
    $.ajax({
        url: uvIndexURL,
        method: "GET"
        }).then(function(response) {
            //make a div to put the UV Index value and color into
            var uvDiv = $('<div>');
            uvDiv.text(response.value)
            
            //check the value of the UV Index and provide a color based on its value
            if(response.value > 0 && response.value <= 2){ uvDiv.attr("class", 'bckColorGreen uv-box') };
            if(response.value > 2 && response.value <= 4){ uvDiv.attr("class", 'bckColorYellow uv-box') };
            if(response.value > 4 && response.value <= 6){ uvDiv.attr("class", 'bckColorOrange uv-box') }; 
            if(response.value > 6 && response.value <= 9){ uvDiv.attr("class", 'bckColorRed uv-box') };
            if(response.value > 9){ uvDiv.attr("class", 'bckColorPink uv-box') };

            //append the UV Index box to the html
            $('#display-uv-index').append(uvDiv);
        });
}

searchBtn.addEventListener('click', function() {
    //make sure there is a value in the input box, otherwise nothing will happen
    if(cityInput.val()){
        //-1 comes up when the index is not found. if -1 doea appear, else will be triggered
        if(currentCityArray.indexOf(cityInput.val().toLowerCase()) !== -1){
            //do nothing because it is already on the list.
        }else {
            //add the new city to the array so it cannot be used again, then append the City Div underneath the input bar
            currentCityArray.push(cityInput.val().toLowerCase());
            var newCityDiv = document.createElement('div');
            newCityDiv.textContent = cityInput.val();
            newCityDiv.classList.add('city-box');
            $("#city-list").append(newCityDiv);

            //call the API infromation using the city name from input/box value
            pullAPI(cityInput.val())
            pull5DayAPI(cityInput.val())
        }
    }else{} //do nothing
});

//collect the name of the city from the city list area, and feed that city back in to have it display it all over again
$("#city-list").on("click", function(event){
    event.preventDefault();
    var cityClicked = event.target.textContent;
    pullAPI(cityClicked);
    pull5DayAPI(cityClicked);
});