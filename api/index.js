// @/main.js
const compression = require("compression");
const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
var cors = require('cors');
const helmet = require("helmet");
var md_auth = require('./middleware/authenticated');
const usuariosRoute = require('./routes/usuarios.routes');
const librosRoute = require('./routes/libros.routes');
const bitacoraRoute = require('./routes/bitacora.routes');
const carreraRoute = require('./routes/carreras.routes');
const Usuario = require('./models/usuarios.model');
const { Global } = require("./models/Global.model");

var app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression()); // Compress all routes

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});


const EXTURI= process.env.EXTURI||'/api';

console.log(EXTURI);

// Apply rate limiter to all requests
app.use(limiter)
app.use(EXTURI+'/usuarios',usuariosRoute);
app.use(EXTURI+'/libros',librosRoute);
app.use(EXTURI+'/bitacora',bitacoraRoute);
app.use(EXTURI+'/carreras',carreraRoute);

app.get(EXTURI+"/global", async (req, res) => {
  const Done = await Global.findById("UNICO");
  if(Done){
    return res.json(Done);
  }
});

app.put(EXTURI+"/global",md_auth.ensureAuth, async (req, res) => {
  const Done = await Global.findByIdAndUpdate("UNICO",req.body);
  if(Done){
    return res.json({ message: "DONE" });
  }
});



// The secret should be an unguessable long string (you can use a password generator for this!)
const JWT_SECRET ="goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";
const JWT_EXPIRE =600;


// Ruta de login
console.log(EXTURI+"/authenticate");
app.post(EXTURI+"/authenticate",async (req, res) => {
  const usuario  = req.body.Usuario;
  const secret  = req.body.Secret;
  console.log(`${usuario} is trying to login ..`);

  const U = await Usuario.findOne({Usuario:usuario, estado:true});
  if(!U){
    return res
    .status(401)
    .json({ message: "The username and password your provided are invalid" });
  }

  const valid = await bcrypt.compare(secret,U.Secret);//true  console.log(valid);

  if(!valid){
    return res.status(401)
    .json({ 
      message: "El usuario y la contraseña son incorrectos"
    });
  }

  console.log(`${usuario} has loggedin successfully ..`);
  return res.status(200).json({
    token: jwt.sign({ user: U.Usuario, privilegios:U.privilegios, id:U._id }, process.env.JWT_SECRET||JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE||JWT_EXPIRE}),
    message: `${usuario} has loggedin successfully ..`
  });
});

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

const dev_db_url ="mongodb://127.0.0.1:27017/biblioteca?authSource=admin";
const mongoDB = process.env.MONGODB_URI || dev_db_url;
console.log(mongoDB);

const start = async () => {
  try {
    await mongoose.connect(mongoDB);
    app.use(allowCrossDomain);
    app.listen(3000, () => console.log(`Server started on port 3000`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();