//first we are going to require the function from the package crypto which is inbuilt in nodeJS and does not need to be installed separately and it is used for encyption
const crypto = require("crypto");

//let us load the secret variable from the env file to this file here using dotenv pachange 
require("dotenv").config();

//In our project we are going to use the aes-256-cbc algorithm for the encryption part where aes stands for advanced encryption standard which is used to shuffle the data, 256 means that we are going to use 256 bits for the key and cbc means cilper block chaining which is used to maintain contiunity and choin the divided chunks 
const ALGORITHM = 'aes-256-cbc';

//let us now generate a encyption key of 32bytes as our encyption algoithm also require 32 * 8 bits = 256 bits 
// const ENCRYPTION_KEY = crypto.randomBytes(32);

//now we will use the permanent encryptionkey present in our .env file
if(!process.env.MY_SECRET_KEY)
    throw new Error("FATAL ERROR : MY_SECRET_KEY is missing from .env file!");

const ENCRYPTION_KEY = process.env.MY_SECRET_KEY;


//Now let us also define the length of the IV string that will be 16 bytes as the AES divides the dat ainto a block of size 128bits and to perfectly mix the IV salt with the data it must have same number of bits which is 128/8 = 16bytes hence length of IV string will be 16 bytes only 
const IV_LENGTH = 16;

//Now let us create our encypt function that will encyrpt the text that we will pass to it 
function encrypt(text)
{
    //first of all lets us create a custom salt that is iv to mix with this text every time we pass text to it a new random iv will be generated of length as we defined earlier that is 16bytes
    let iv = crypto.randomBytes(IV_LENGTH);

    //Now we will create the ultimate machine that will convert normal text into encytped text using the rules which i have defined which are using the aes-256 algoithm the key we generated and the IV as the salt 
    //we used Buffer.from() so that whatever form our key is in it it gets converted to binary form 
    let cipher = crypto.createCipheriv(ALGORITHM,Buffer.from(ENCRYPTION_KEY,'hex'),iv);
    //Now our machine is ready 

    //Now let us put our text into the machine so that it becomes enctypted and store it in a variable named encrypted 
    let encrypted = cipher.update(text);//we puuted the text in our machine

    //Now there may be chances that our data is less then 16 bytes or 128bits as a result of which our aes will wait for more data to make a fulll block so the machine waits for more and nothing comes in encytped 

    //so we have to force the data our by adding padding by using final 
    let padded = cipher.final();//adds some bits to make a block of 16bytes

    //now let us concatinate the encrypted data adn left over encytped data that we got by padding and get the fully encrypted string
    encrypted = Buffer.concat([encrypted,padded]);//acts as a glue 

    // now let us convert both iv and this encypted text to hexadecimal as printing the biffer text that is ocmbination of 1 and 0 may lead to unexpected behavior where as hexadecimal will be safe strings which wont cause any unexpected behavior 

    //we have seprated them from colon because iv has two roles first is giving different forms to same string and other is it is used for decyption as well
    return iv.toString('hex') + ":" + encrypted.toString('hex');
}

//now let us create a function to decypt the text when it has reaced safely its destination to make it in readable format 
function decrypt(text)
{
    //first we know that our encypted text has two parts iv : encrypted so we will get that by using array destructuring here 
    let [iv,encryptedText] = text.split(":");

    //Now we will convert both the iv and encytped text back to the binary form which we converted to hex form for transportation adn here we have to metion it is hex text as by default node assumes that the text is utf-8
    iv=Buffer.from(iv,'hex');
    encryptedText=Buffer.from(encryptedText,'hex');

    //just like we make the cipher we will make the dicipher which will convert the encrypted text into decypted text and here we have to use everything as same the algoithm the key and the iv as well to decrypt purely 
    let dicipher = crypto.createDecipheriv(ALGORITHM,Buffer.from(ENCRYPTION_KEY,'hex'),iv);

    //now in the same manner we did in encyt we have to do here 

    //add the text to the machine that is dicipher
    let decrypted = dicipher.update(encryptedText);

    //but if the block is remained incomplete in the machine 
    let padded = dicipher.final();//adds a paddded data to the machien and forces the leftover data to come out as well

    //now lets glue it togetether
    decrypted = Buffer.concat([decrypted,padded]);

    //now we have binary form of our text let us convert this to normal string form and return it 
    return decrypted.toString();
}


// console.log(encrypt("PRAKHAR UYOU ARE NOT GY"));
// a9a970a5273d0a542ede6db1742e4847:d80c6621ab6ca9101332cf01e5569eb8442434741d79ea396c613548ced9a6c6
console.log(decrypt("a9a970a5273d0a542ede6db1742e4847:d80c6621ab6ca9101332cf01e5569eb8442434741d79ea396c613548ced9a6c6"));