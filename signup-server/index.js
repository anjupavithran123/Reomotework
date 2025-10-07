
const express = require("express")
const mongoose=require('mongoose')
const cors=require('cors')
const EmployeeModel=require('./models/Employee')
const bcrypt = require("bcrypt"); // npm i bcrypt


const app=express()
app.use(express.json())
app.use(cors())

mongoose.connect('mongodb+srv://anjupavithranm95_db_user:1234@cluster0.xyiidkl.mongodb.net/employee')

// inside your server file


app.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body); // DEBUG

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // normalize email (front/back must use same normalization)
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await EmployeeModel.findOne({ email: normalizedEmail }).lean();
    if (!user) {
      console.log("User not found for:", normalizedEmail);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stored = user.password ?? "";

    // If stored password looks like a bcrypt hash, use bcrypt.compare
    const looksLikeBcrypt = typeof stored === "string" && stored.startsWith("$2");

    let passwordMatch = false;
    if (looksLikeBcrypt) {
      passwordMatch = await bcrypt.compare(password, stored);
    } else {
      // plaintext fallback (not recommended for prod)
      passwordMatch = stored === password;
    }

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // success: return minimal user info
    return res.json({ success: true, message: "Login successful", user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post('/register',(req,res)=>{

EmployeeModel.create(req.body)
.then(employees =>res.json(employees))
.catch(err=>res.json(err))
})

app.listen(3001,()=>{
    console.log("server is running")
})
