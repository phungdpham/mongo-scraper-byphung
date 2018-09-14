//Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Requiring all models
var db = require("./models");

var PORT = process.env.PORT || 3000;


//Initialize Express;
var app = express();

//Set Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

//Use morgan logger for logging requests
app.use(logger("dev"));
//Use body-parser for handling form submisision
app.use(bodyParser.urlencoded({ extended: true }));
//Use express.static to server the public folder as a static directory
app.use(express.static("public"));

//connect to the Mongo DB
var MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);

//Checking if any mongoose erros
// db.on("error", function(err) {
//     console.log("Mongoose Error: ", err);
// });

//Logging a success message if succesfully logged into the db through moongoose
// db.once("open", function() {
//     console.log("Mongoose connection succesfull.");
// });

//Routes

//Get rquest to render Handlebars pages
app.get("/", function (req, res) {
    db.Article.find({ "saved": false }, function (err, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    })
});

//A Get route for scraping New  York Times website
app.get("/scrape", function (req, res) {
    //First, grabing the body of the html with request
    axios.get("https://www.nytimes.com/").then(function (response) {
        //Then, loading that into cherio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        //Now, grabing every h2  for the headline
        $(".article").each(function (i, element) {
            //save an empty result object
            var result = {};
            //add the text and href of every link, and save them
            result.title = $(this)
                .children("h2")
                .text();
            result.summary = $(this)
                .children(".summary")
                .text();
            result.link = $(this)
                .children("h2").children("a")
                .attr("href");
            //Creating a new Article using the result object built from scraping
            entry.save(function (err, doc) {
                if (err) {
                    console.log(err);
                }
                //Or log doc
                else {
                    console.log(doc);
                }
            });
            //     db.Article.create(result)
            //         .then(function(dbArticle) {
            //             //view the added result in the console
            //             console.log(dbArticle);
            //         })
            //         .catch(function(err) {
            //             return res.json(err);
            //         });
            // });
            // console.log(result);

            // //Sending a message to client after sucesfully scraping and saving an Article
            res.send("Scrape Complete");
        });
    });
});

    //Route for getting all articles from the db
    app.get("/articles", function (req, res) {
        //Grab every document in the Article collection
        db.Article.find({})
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    //Route for deleting an article
    app.post("/articles/delete/:id", function (req, res) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": false, "notes": [] })
            .then(function (dbArticle) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(dbArticle);
                }
            })
    });

    //Route for grabbing a specific Article By id, populate it with its notes
    app.get("/articles/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id })
            .populate("note")
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    //route for saving an article
    app.post("/articles/save/:id", function (req, res) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true })
            .then(function (err, dbArticle) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(dbArticle);
                }
            });
    });

    //Route for saving/updating an Article's associated Note
    app.post("/notes/save/:id", function (req, res) {
        // var newNote = new Note({
        //     body: req.body.text,
        //     article: req.params.id
        // });
        // console.log(req.body);
        //Saving new note to the db
        db.Note.create(req.body)
            .body(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote.id }, { new: true });
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            })
    });

    //Routes for deleting a note
    app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
        db.Note.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
            if (err) {
                console.log(err);
                res.send(err);
            }
            else {
                db.Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
                    .then(function (dbNote) {
                        res.json(dbNote)
                    })
                    .catch(function (err) {
                        res.json(err);
                    })
            }
        });
    });
    //Start the server
    app.listen(PORT, function() {
        console.log("App running on port " + PORT + "!")
    });

