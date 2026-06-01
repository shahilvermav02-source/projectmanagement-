import dotenv from "dotenv"
import app from './app.js'
import connectDB from "./db/index.js"
dotenv.config()

const port = process.env.PORT || 3000


connectDB()
        .then(()=>{
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        })
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error);
            process.exit(1);
        })

