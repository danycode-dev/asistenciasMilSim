import express from "express";
import appRoutes from "./routes/app.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import authRoutes from "./auth/auth.routes.js";
import membersRoutes from "./routes/members.routes.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import { initAdmUser } from "./services/initAdmUser.js";

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
initAdmUser()

app.use("/app", appRoutes);
app.use("/events", eventsRoutes);
app.use("/auth", authRoutes);
app.use("/members", membersRoutes);
//features
//app.use("/users", usersRoutes);
//app.use("/ranks", ranksRoutes);
//app.use("/roles", rolesRoutes);
//app.use("/logs", logsRoutes);
//app.use("/units", unitsRoutes);

//app.use((req, res, next) => {
//  res.status(404).json({ message: "Endpoint not found" });
//});
export default app;