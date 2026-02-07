//first we will reqyure the express function from the express package
const express = require("express");

//let us also require the object that we willl need to join the paths whose name is path
const path = require("path");

//now we shall geberate the app object by executing this express function which will help us to listen to request
const app = express();

//now we shall make the server learn how to understadn js and url encoded files by using middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Now also set the path of our views folder permanently so that we call the server from elsewhere it is able to find the views folder always
app.set('views',path.join(__dirname,'../views'));
app.use(express.static(path.join(__dirname,'../public')));

//Also let us set our view engine to ejs ??
app.set('view engine','ejs');

//We are done with the permanent setup now let us start masking our routes 

//1.The first route we will create is for home page 
app.get("/",(req,res)=>{
    res.render("landing.ejs");
});

//2.Now we will create the second broute that will brender the google form that have to be filled in order to send the flashtext
app.get("/new",(req,res)=>{
    res.render('new');
})

//lets define the PORT where the serve rwill run 
const PORT = process.env.PORT || 3000;

//Now also let us start our server and listen to the request 
app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
});