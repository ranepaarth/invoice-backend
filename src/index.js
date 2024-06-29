import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { PORT } from "./constants.js";
import invoiceRouter from "./routes/invoice.routes.js"

const app = express();

app.use(express.json({ limit: "16kB" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1',invoiceRouter)

app.listen(PORT, () => {
  console.log(`${Date()} Server Running on port: ${PORT}`);
});
