import express from "express";
import { generateInvoice } from "../controllers/invoice.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router
  .route("/generate-invoice")
  .post(upload.single("signature"), generateInvoice);

export default router;
