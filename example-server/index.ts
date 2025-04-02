import express, { Request, Response } from "express";
import { fileURLToPath } from 'url';
import path from 'path';
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
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Middleware
app.use(cors());
app.use(bodyParser.json());

async function handleRequest<T>(
  req: Request,
  res: Response<T>,
  handler: (req: Request, res: Response) => Promise<T>,
) {
  try {
    const result = await handler(req, res);
    res.json(result);
  } catch (error: any) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: error.message } as any);
  }
}

app.get('/oauth/redirect', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'oauth-redirect.html'));
});


app.post("/auth/getSubOrgId", (req, res) =>
  handleRequest(req, res, getSubOrgId),
);
app.post("/auth/initOtpAuth", (req, res) =>
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
