const express = require("express");
const dbconnection = require("./Database/db");
const multer = require("multer");
const mongoose = require("mongoose");
const port = process.env.PORT || 340;
const app = express();

// set the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set the view engine
app.set("view engine", "ejs");


// set the file static
app.use(express.static('uploads'));




app.get("/", (req, res) => {
  res.render("home");
});



/// the error handling function is here 
const errorHandler =(err)=>{
  console.log(err.message,err.code)
  let errors = {};

  if(err.message.includes("User validation failed")){
    Object.values(err.errors).forEach(({properties})=>{
      errors[properties.path] = properties.message
    })
  }
  return errors
}

  

// user schema
const UserSchema = mongoose.Schema({
  userName: {
    type: String,
    required: [true,'username is required'],
  },
  password: {
    type: String,
    required: [true,'password is required'],
  },
  // profileImage: {
  //   type: String,
  // },
});

const UserModel = mongoose.model("User", UserSchema);

/// upload image using multer
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const uploads = multer({ storage: userStorage }).single("profileImage");

app.post("/register", uploads, async (req, res) => {
  console.log("Reached /register route");

  try {
    const userData = {
      userName: req.body.name,
      password: req.body.password,
      profileImage: req.file ? req.file.filename : null, // Check if req.file exists
    };

    console.log("Received data:", userData);

    const user = await UserModel.create(userData);
    if (user) {
      console.log("User data inserted:", user);
      res.status(200).json({
        message: "User data inserted",
        success: true,
        user,
      });
    } else {
      console.log("Failed to insert user data");
      res.status(400).json({
        message: "User data not inserted",
        success: false,
      });
    }
  } catch (e) {
    const error = errorHandler(e);
    res.status(400).json({ error });
  }
});



app.get("/data", async (req, res) => {
    try {
      const users = await UserModel.find();
      if (users && users.length > 0) {
        res.render("data", {
          users: users,
        });
      } else {
        res.status(404).json({
          message: "No users found",
          success: false,
        });
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  });
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
