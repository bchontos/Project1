let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
function initMap() {
    // Initialize variables
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;
    /* TODO: Step 4A3: Add a generic sidebar */
    infoPane = document.getElementById('panel');

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map = new google.maps.Map(document.getElementById('map'), {
                center: pos,
                zoom: 100
            });
            bounds.extend(pos);

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);

            // Call Places Nearby Search on user's location
            getNearbyPlaces(pos);
        }, () => {
            // Browser supports geolocation, but user has denied permission
            handleLocationError(true, infoWindow);
        });
    } else {
        // Browser doesn't support geolocation
        handleLocationError(false, infoWindow);
    }
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
    // Set default location to Sydney, Australia
    pos = { lat: -33.856, lng: 151.215 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 20
    });

    // Display an InfoWindow at the map center
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Geolocation permissions denied. Using default location.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
    currentInfoWindow = infoWindow;

    // Call Places Nearby Search on the default location
    getNearbyPlaces(pos);
}

// Perform a Places Nearby Search Request
function getNearbyPlaces(position) {
    let request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: 'grocery'
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
}

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers(results);
    }
}

// Set markers at the location of each place result
function createMarkers(places) {
    places.forEach(place => {
        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
        });

        /* TODO: Step 4B: Add click listeners to the markers */
        // Add click listener to each marker
        google.maps.event.addListener(marker, 'click', () => {
            let request = {
                placeId: place.place_id,
                fields: ['name', 'formatted_address', 'geometry', 'rating',
                    'website', 'photos']
            };

            /* Only fetch the details of a place when the user clicks on a marker.
             * If we fetch the details for all place results as soon as we get
             * the search response, we will hit API rate limits. */
            service.getDetails(request, (placeResult, status) => {
                showDetails(placeResult, marker, status)
            });
        });

        // Adjust the map bounds to include the location of this marker
        bounds.extend(place.geometry.location);
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    map.fitBounds(bounds);
}

/* TODO: Step 4C: Show place details in an info window */
// Builds an InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let placeInfowindow = new google.maps.InfoWindow();
        let rating = "None";
        if (placeResult.rating) rating = placeResult.rating;
        placeInfowindow.setContent('<div><strong>' + placeResult.name +
            '</strong><br>' + 'Rating: ' + rating + '</div>');
        placeInfowindow.open(marker.map, marker);
        currentInfoWindow.close();
        currentInfoWindow = placeInfowindow;
        showPanel(placeResult);
    } else {
        console.log('showDetails failed: ' + status);
    }
}

/* TODO: Step 4D: Load place details in a sidebar */
// Displays place details in a sidebar
function showPanel(placeResult) {
    // If infoPane is already open, close it
    if (infoPane.classList.contains("open")) {
        infoPane.classList.remove("open");
    }

    // Clear the previous details
    while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
    }

    /* TODO: Step 4E: Display a Place Photo with the Place Details */
    // Add the primary photo, if there is one
    if (placeResult.photos) {
        let firstPhoto = placeResult.photos[0];
        let photo = document.createElement('img');
        photo.classList.add('hero');
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
    }

    // Add place details with text formatting
    let name = document.createElement('h1');
    name.classList.add('place');
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    if (placeResult.rating) {
        let rating = document.createElement('p');
        rating.classList.add('details');
        rating.textContent = `Rating: ${placeResult.rating} \u272e`;
        infoPane.appendChild(rating);
    }
    let address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);
    if (placeResult.website) {
        let websitePara = document.createElement('p');
        let websiteLink = document.createElement('a');
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
    }

    // Open the infoPane
    infoPane.classList.add("open");
}


$(document).ready(function () {

    
    $("#search-button").on("click", function () {

        $( ".col-sm-4" ).remove();
        //document.body.style.background = "url('bkg.jpg')";
        $("body").css("background-image", "url('bkg.jpg')");
        $("body").css("background-repeat", "no-repeat");
        $("body").css("background-size", "cover");

        var searchValue = $("#search").val();

        // clear input box
        $("#search").val("");

        getrecipe(searchValue);
    });

    function getsource(source) {
        $.ajax({
            url: "https://api.spoonacular.com/recipes/" + source + "/information?apiKey=d29b190915f44c75ab8b9ff6dd0dafb3",
            success: function (res) {
                console.log(res)

                document.getElementById("sourceLink").innerHTML = res.sourceUrl
                console.log(res.sourceUrl)
                document.getElementById("sourceLink").href = res.sourceUrl
                console.log(res.summary)
                document.getElementById("textSummary").innerHTML =  "<div class='scrollbar'>" + res.summary + "<div>"
                
            }
        });

    }
    function getrecipe(input) {
        $.ajax({
            url: "https://api.spoonacular.com/recipes/search?apiKey=d29b190915f44c75ab8b9ff6dd0dafb3&number=1&query=" + input,
            success: function (res) {
         
                var col = $("<div>").addClass("col-sm-4");
                var card2 = $("<div>").addClass("card2 mb-3").attr('id','card-2');
                var imgELEMENT = $("<img>").attr('id','card2-img').addClass("card-img-top");
                var cardBody2 = $("<div>").addClass("card2-body");
                var cardTitle = $("<h5>").addClass("card2-title").attr('id','card2-title');
                var textSummary2 = $("<div>").addClass("textSummary").attr('id','textSummary');
                var cardText2 = $("<p>").addClass("card2-text").text("");
                var small2 = $("<small>").addClass("text-muted");
                var refrence2 = $("<a>").attr('id','sourceLink');

                $("#mainPage").attr('class', 'col-sm-1');
                $( "#mainPage" ).remove();

                small2.append(refrence2);
                cardText2.append(small2);
                cardBody2.append(cardTitle, textSummary2, cardText2);
                card2.append(imgELEMENT, cardBody2);
                col.append(card2)
                $(".row").append(col);

                document.getElementById("card2-title").innerHTML = res.results[0].title
                $("#card2-img").attr("src",res.baseUri + res.results[0].image);
                getsource(res.results[0].id)
                GetRecipe2(input);
            }
        })
    }

        //Methos to get the recipes by ajax call
        var GetRecipe2 = function(input2) {
            var search = input2;
            var appid = "897772a2";
            var appkey = "c193011b1550064d6ebf4a7adb2ac3e8";
            var from = "0"
            var to = "1"
            var queryURL = "https://api.edamam.com/search?q="+search+"&from=" + from + "&to=" + to + "&app_id="+appid+"&app_key="+appkey;
            $.ajax({
                url: queryURL,
                method: "GET",                
              })
            .then(function(response) {
                console.log(response);
                console.log("https://api.edamam.com/search?q="+search+"&from=" + from + "&to=" + to + "&app_id="+appid+"&app_key="+appkey);

                var col = $("<div>").addClass("col-sm-4");
                var card3 = $("<div>").addClass("card3 mb-3").attr('id','card-3');
                var imgELEMENT = $("<img>").attr('id','card3-img').addClass("card-img-top");
                var cardBody3 = $("<div>").addClass("card3-body");
                var cardTitle = $("<h5>").addClass("card3-title").attr('id','card3-title');
                var textSummary3 = $("<div>").addClass("textSummary").attr('id','textSummary3');
                var cardText3 = $("<p>").addClass("card2-text").text("");
                var small3 = $("<small>").addClass("text-muted");
                var refrence3 = $("<a>").attr('id','edamam');

                small3.append(refrence3);
                cardText3.append(small3);
                cardBody3.append(cardTitle, textSummary3, cardText3);
                card3.append(imgELEMENT, cardBody3);
                col.append(card3)
                $(".row").append(col);

                console.log("title", response.q)
                console.log("image", response.hits[0].recipe.image)
                document.getElementById("card3-title").innerHTML = response.hits[0].recipe.label
                $("#card3-img").attr("src",response.hits[0].recipe.image);

                document.getElementById("edamam").innerHTML = response.hits[0].recipe.shareAs
                console.log(response.hits[0].recipe.shareAs)
                document.getElementById("edamam").href = response.hits[0].recipe.shareAs
                console.log(response.hits[0].recipe.shareAs)

            });
         };     
         
})



