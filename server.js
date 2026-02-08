//first we will reqyure the express function from the express package
const express = require("express");

//let us also require the object that we willl need to join the paths whose name is path
const path = require("path");

//now we shall geberate the app object by executing this express function which will help us to listen to request
const app = express();

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

//now we shall make the server learn how to understadn js and url encoded files by using middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Now also set the path of our views folder permanently so that we call the server from elsewhere it is able to find the views folder always
app.set('views',path.join(__dirname,'./views'));
app.use(express.static(path.join(__dirname,'./public')));

//Also let us set our view engine to ejs ??
app.set('view engine','ejs');

//lets define the PORT where the serve rwill run 
const PORT = process.env.PORT || 3000;

//let us now use the supabase or the postgre sql database which is hosted by supabase 
// first we will require the method to access the supabase 
const { createClient } = require("@supabase/supabase-js");

//now we will connect to the supabase to access it by making a object which has all the tools to acces and modify it as well
const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

//We are done with the permanent setup now let us start masking our routes 

//let us import the encrypt and decrypt functions from util.ejs
const {encrypt,decrypt} = require('./utils/crypto.js');

// for the time being when we have not used our databse we will using a array to storethese delete messages 
let flashTexts = [];

//1.The first route we will create is for home page 
app.get("/",(req,res)=>{
    res.render("landing.ejs");
});

//2.Now we will create the second broute that will brender the google form that have to be filled in order to send the flashtext
app.get("/new",(req,res)=>{
    res.render('new');
});

//3.Now we will make a route for making a link for this text 
app.post("/secret",async (req,res)=>{
    //let us get the text which the user has entered , the validity time adn the view time limit 
    let { text, validity,viewLimitSet,viewLimit} = req.body;

    //now let us encrypt our text also 
    let encryptedText = encrypt(text);

    //let us calculate the validity of the expirationTime
    let expirationTime = (parseInt(validity)*60*1000)+Date.now();

    //now let us store this flashtext
    const {data,error}= await supabase
    .from("FlashTexts")
    .insert([
        {
            encryptedText:encryptedText,
            expirationTime:expirationTime,
            viewLimit : viewLimitSet=="on" ? parseFloat(viewLimit)*60*1000 : null
        }
    ])
    .select();//to get the id back

    if(error)
    {
        console.log("Supabase Error : ",error);
    }

    //creating the link to send to the object page 
    let link =`${req.protocol}://${req.host}`;
    let id = data[0].id;
    res.render("success",{link,id});
});

"Hey App, wait for a second (await). Go to the database (supabase), open the 'secrets' table (.from), and get all the details (.select). Look for the specific row where the ID matches this one (.eq). Since IDs are unique, I only want that one specific item, not a list (.single). When you get it, unpack the result into 'data' and 'error' variables (const { data, error })."

//now we will make the 4th and dinal route to make them see the view once 
app.get("/secret/:id",async (req,res)=>{
    let link = `${req.protocol}://${req.host}`;
    //lets get the id
    let {id} = req.params;

    //first we will get this data from the database 
    let {data,error} = await supabase
    .from('FlashTexts')
    .select('*')
    .eq('id',id)
    .single();

    //we will first check if the secret exist or not or has bveen deteleted
    if(error || !data)
    {
        return res.render("error",{link});
    }
    //the link has expired 
    else if(data.expirationTime<Date.now())
    {
        //we will delete the data
        await supabase.from("FlashTexts").delete().eq('id',id);
        return res.render("expire",{link});
    }
    // //if we have not send any reponse till now then we will load the data and detelete it 
    // //lets get the text 
    // let encryptedText = data.encryptedText;
    // //lets check if this exits 
    //     //Now lets check if the time of expiration has passed the current time or not 
    //     if(flashTexts[id].expirationTime<Date.now())
    //         {
    //             //we will delete it snd show teh user that it does not exist anymore
    //     delete flashTexts[id];

    //     //we will them that it has been expired
    //     return res.render("expire");
    // }
    // else 
    //     {
    //     //storing thje values for the future use
    //     let viewLimit = flashTexts[id].viewLimit;

        //lets decrypty the text 
        let secret = decrypt(data.encryptedText);
        let viewLimit = data.viewLimit;

        //now there exitst text so first we will delete it from the databse 
        await supabase.from("FlashTexts").delete().eq('id',id);

        //now we have to decrypyt it and render it in a view once fashion or in a view limiut fashion 
        res.render("reveal",{secret,limitTime:viewLimit,link});
    });

//a thank you path after copying the text or the link\
app.get("/end",(req,res)=>{
    res.render("copied");
})


//Now also let us start our server and listen to the request 
app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
});