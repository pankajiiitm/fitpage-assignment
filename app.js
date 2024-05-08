import cors from "cors";
import express, { json } from "express";
import { config } from "dotenv";
import weatherRoutes from './routes/weatherRoutes.js'
import locationRoutes from './routes/locationRoutes.js'

config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(json());
const PORT = process.env.PORT;
app.use(weatherRoutes)
app.use(locationRoutes)


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
