const express = require("express");
const app = express();
let mongoose = require("mongoose");
let passport = require("passport");
let auth = require("./controllers/auth");
let store = require("./controllers/store");
let User = require("./models/user");
let localStrategy = require("passport-local");
const session = require('express-session');


//importing the middleware object to use its functions
var middleware = require("./middleware") //no need of writing index.js as directory always calls index.js by default
var port = process.env.PORT || 3000;



app.use(express.static("public"));
/*  CONFIGURE WITH PASSPORT */



app.use(
  require("express-session")({
    secret: "decryptionkey", //This is the secret used to sign the session ID cookie.
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //middleware that initialises Passport.
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //used to authenticate User model with passport
passport.serializeUser(User.serializeUser()); //used to serialize the user for the session
passport.deserializeUser(User.deserializeUser()); // used to deserialize the user

app.use(express.urlencoded({ extended: true })); //parses incoming url encoded data from forms to json objects
app.set("view engine", "ejs");

//THIS MIDDLEWARE ALLOWS US TO ACCESS THE LOGGED IN USER AS currentUser in all views
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


// /* TODO: CONNECT MONGOOSE WITH OUR MONGO DB  */
// const mongoDB = 'mongodb+srv://invibeast:backend@cluster0.pt4rr.mongodb.net/library_list?retryWrites=true&w=majority';
// mongoose.connect(mongoDB, { useNewUrlParser: true ,useCreateIndex:true, useUnifiedTopology: true,useFindAndModify:false});
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose
  .connect('mongodb+srv://invibeast:backend@cluster0.pt4rr.mongodb.net/library_list?retryWrites=true&w=majority')
  .then(() => {
    console.log("MONGO connection successful");
  })
  .catch((err) => {
    console.log(" connection error");
    console.log(err);
  });
//************************************************************************************************************************//
app.get("/", (req, res) => {
  res.render("index", { title: "Library" });
});


/*-----------------Store ROUTES
TODO: Your task is to complete below controllers in controllers/store.js
If you need to add any new route add it here and define its controller
controllers folder.
*/
app.get("/books", store.getAllBooks);

app.get("/book/:id", store.getBook);

app.get("/books/loaned",middleware.isLoggedIn,store.getLoanedBooks);
//TODO: call a function from middleware object to check if logged in (use the middleware object imported)
app.post("/books/issue",middleware.isLoggedIn, store.issueBook);

 //TODO: call a function from middleware object to check if logged in (use the middleware object imported)

app.post("/books/search-book", store.searchBooks);

/* TODO: WRITE VIEW TO RETURN AN ISSUED BOOK YOURSELF */
//app.post("/books/return-book", store.returnBooks);
  



/*-----------------AUTH ROUTES
TODO: Your task is to complete below controllers in controllers/auth.js
If you need to add any new route add it here and define its controller
controllers folder.
*/

app.get("/login", auth.getLogin);


app.post("/login",passport.authenticate("local", {failureRedirect: "/login",failureMessage: true,keepSessionInfo: true,}),auth.postLogin);

app.get("/register", auth.getRegister);

app.post("/register", auth.postRegister);

app.get("/logout", auth.logout);

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
