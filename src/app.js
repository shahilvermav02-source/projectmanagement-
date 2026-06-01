import express from "express"
import cors from "cors"
import healthcheckRoutes from "./routes/helathcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser" 



const app= express()
//basic configuration
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public")) // to serve static files from the "public" directory
app.get("/",(req,res)=>{  
    res.send("welcom to basecampy")})

app.use(cookieParser())

//cors configurations
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",// Allow requests from the specified origin(s)
    credentials: true,// Allow cookies to be sent in cross-origin requests
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

//routes
app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/auth", authRouter);

app.get("/test", (req, res) => {
   res.send("test works")
})

export default app 