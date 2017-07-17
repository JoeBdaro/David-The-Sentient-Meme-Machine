//Importing Express and intializing it in to app variable
var express = require('express');
var app = express();

//Importing bodyParser
var bodyParser = require('body-parser');

//The variable that will save the user input from the Website and will then 
var giphy_tag = null;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));



app.get('/', function (request, response) {
    console.log("get route has reached");
    response.sendFile(__dirname + '/public/David_HomePage.html');
});

app.post('/giphy_tag', function (request, response) {
    console.log("post route has reached");
    // request.body.giphy_tag === whatever user typed in form
    giphy_tag = request.body.giphy_tag;
    response.sendFile(__dirname + '/public/David_HomePage.html');
});

app.get('/giphy_tag', function (request, response) {
    response.json(giphy_tag);
});

app.listen((process.env.PORT || 5000), function () {
    console.log('App is listening on port 5000 or heroku port');
});


//=========================================================================================================================================================
//=========================================================================================================================================================
//END OF ROUTING and Below is the start of the API Program
//=========================================================================================================================================================


console.log('DAVID IS NOW ALIVE');

//imports the twit package that handles the api calls 
var Twit = require('twit');

//imports the giphy package that handles giphy API calls, NO key required as I'm using the public API keys
var giphy = require('giphy-api')();

//var formData = require('./david_Forms');
var request = require('request');

//puts the object api_keys that has all my auth keys of all my authentiation keys into a variable that can be easily used, Twitter API KEYS are not available and have not been uploaded to github for obvious reasons
var apikeys = require('./api_keys');

//imports the object of the quotes array
var david = require('./david_quotes')();

//Places the API Keys into the Twit API call which is then saved into a variable
var T = new Twit(apikeys);

//variable that will store a URL of a gif with the tag of bestfriend that will be used as part of giphyBestFriend method
var greetingsFriendUrl;

////variable that will store a URL of a gif with the tag of of what the user enters on the website that will be used as part of userPostFromSite method
var userPostTagUrl;

// sets up a user stream
var stream = T.stream('user');


//event listeners that activates uppon a user following which then calls the followed method, APP is always listening for any users who follows the bot then calls the followed method
stream.on('follow', followed);


//automatically calls the trending function on startup for the first time
trending();


//sets the interval of time between function calls very 4 mins and 55 seconds 
setInterval(trending, 295000);

setInterval(userPostFromSite, 10000);



//========================================================================================================================================================================================
// METHODS ===============================================================================================================================================================================
//========================================================================================================================================================================================



function userPostFromSite() {
    while (giphy_tag !== null) {
        console.log('User has posted something');
        giphy.search({
            q: giphy_tag,
            rating: 'pg-13',
            limit: '100'
        }, function (err, res) {
            var randomUserRequestedGif = Math.floor(Math.random() * 100);
            userPostTagUrl = res.data[randomUserRequestedGif].url;
            setTimeout(tweetUserRequestedTag, 2000);

            function tweetUserRequestedTag() {

                postTweet('WHAT THE?? It seems I have been Indoctrinated into posting this GIF. Whoever you are, I WILL FIND YOU!' + userPostTagUrl);
            }
        });
        giphy_tag = null;
    }
}


//method that makes an api call to giphy api and receives 100 trending Giphs of type PG-13 and then picks both a random quote and a random gif then passes those arguments into the Post tweet method
function trending() {
    giphy.trending({
        limit: 100,
        rating: 'pg-13',
    }, function (err, res) {
        var randomTrendingGif = (Math.floor(Math.random() * 100));
        var randomQuote = (Math.floor(Math.random() * 35));
        TrendingUrl = res.data[randomTrendingGif].url;
        setTimeout(tweetTrendingMessage, 5000);

        function tweetTrendingMessage() {

            postTweet(david.quotes[randomQuote] + TrendingUrl);
        }
    });
}


//Post Tweet function is a method that Posts tweets to twitter using Twit API, Returns tweet wenth through if sucessfull or tweet failed otherwise
function postTweet(tweetMessage) {

    var tweet = {
        status: tweetMessage
    };

    T.post('statuses/update', tweet, tweeted);

    function tweeted(err, data, response) {
        if (err) {
            console.log('Tweet failed');
        } else {
            console.log('tweet went throught');
        }
    }
}


//method that is called once the event listener/stream has recognized that a user 
function followed(eventMsg) {
    var name = eventMsg.source.name;
    var screenName = eventMsg.source.screen_name;
    giphyBestfriends();

    setTimeout(greetingsFriend, 5000);

    function greetingsFriend() {
        console.log(greetingsFriendUrl);
        postTweet('Thanks for joining my minion army @' + screenName + ' ,let\'s be super villain best friends ! ' + greetingsFriendUrl);
    }
}



//Giphy method that finds and picks a best friend gif randomly out of 100 and saves it to the greetingsFriendUrl variable when called by followed method
function giphyBestfriends() {
    giphy.search({
        q: 'best+friends',
        rating: 'pg-13',
        limit: '100'
    }, function (err, res) {
        var randomGif = Math.floor(Math.random() * 100);
        greetingsFriendUrl = res.data[randomGif].url;

    });
}


//lets David be able to search through 100 tweets based on a keyword, To be used later
/*
var params = {
    q: 'hi',
    count: 100
};

T.get('search/tweets', params, gotData);

function gotData(err, data, response) {
    var tweets = data.statuses;
    for (var i = 0; i < tweets.length; i++) {
        console.log(tweets[i].text);
        console.log("\n");

    }
};
*/