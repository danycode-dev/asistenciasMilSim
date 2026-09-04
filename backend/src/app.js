import express from "express";
import appRoutes from "./routes/app.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import authRoutes from "./auth/auth.routes.js";
import membersRoutes from "./routes/members.routes.js"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // acepta cualquier origin dinámicamente
  },
  credentials: true
}));
//app.use(cors({
//  origin: "http://127.0.0.1:5173", 
//  credentials: true
//}));

app.use(express.json());
app.use(cookieParser());


app.use("/app", appRoutes);
app.use("/events", eventsRoutes);
app.use("/auth", authRoutes);
app.use("/members", membersRoutes)

export default app;