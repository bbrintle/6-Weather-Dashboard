function lalalapullAPI(cityName){

    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=07a5be9b6278338d5fd01e132774742f";

    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
            console.log(response);
        });
};