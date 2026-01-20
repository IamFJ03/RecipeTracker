require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = process.env.PORT || 5000

const authRouter = require("./routes/auth.routes");
const paymentRouter = require("./routes/payment.routes"); 
const cartRouter = require("./routes/cart.routes");
const recipeRouter = require("./routes/recipe.routes");
const connectDB = require("./connectDB");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: "https://flavorfind1.netlify.app",
    credentials: true
}));


app.use("/api/authentication", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/recipe", recipeRouter);
app.use("/api/payment", paymentRouter);


app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
    connectDB(); 
});