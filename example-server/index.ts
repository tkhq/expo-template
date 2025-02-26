import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {
  getSubOrgId,
  initOtpAuth,
  otpAuth,
  oauthLogin,
  createSubOrg,
} from "./src/handler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

async function handleRequest<T>(
  req: Request,
  res: Response<T>,
  handler: (req: Request) => Promise<T>,
) {
  try {
    const result = await handler(req);
    res.json(result);
  } catch (error: any) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: error.message } as any);
  }
}

app.post("/auth/getSubOrgId", (req, res) =>
  handleRequest(req, res, getSubOrgId),
);
app.post("/auth/initOTPAuth", (req, res) =>
  handleRequest(req, res, initOtpAuth),
);
app.post("/auth/otpAuth", (req, res) => handleRequest(req, res, otpAuth));
app.post("/auth/oAuthLogin", (req, res) => handleRequest(req, res, oauthLogin));
app.post("/auth/createSubOrg", (req, res) =>
  handleRequest(req, res, createSubOrg),
);

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);
