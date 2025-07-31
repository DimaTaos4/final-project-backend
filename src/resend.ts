import dotenv from "dotenv";

import { Resend } from "resend";
dotenv.config();
const { RESEND_API_KEY } = process.env;
const resend = new Resend(RESEND_API_KEY!);

export default resend;
