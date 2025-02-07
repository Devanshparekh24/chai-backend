import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()
const port = 3000

app.use(express.json({limit:"20kb"}))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))
app.use(express.urlencoded({extended:true, limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes imports 
import  userRoutes from "./routes/user.routes.js"

// routes declaration 
app.use("/api/v1/users",userRoutes)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))