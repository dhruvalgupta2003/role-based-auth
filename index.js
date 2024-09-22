import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';
dotenv.config()

const app = express();
app.use(express.json());

// PORT NO
const PORT = process.env.PORT || 5001;

app.get('/',(req,res)=> {
    res.send("Hello World!")
})


// add routes
app.use('/api/auth', authRoutes)

app.listen(PORT, ()=> {
    connectDB();
    console.log(`Server is running on port ${PORT}`)
})  