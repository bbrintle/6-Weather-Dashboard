function getUVIndexData(uvURL){
    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(function(response){ 
        console.log(response.value)
        return response.value;
    });
}