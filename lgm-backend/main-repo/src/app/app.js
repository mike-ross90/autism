import express from "express";
import bodyParser from "body-parser";
import router from "../routes/index.js";
import { ResHandler } from "../utils/custom-response/response-handler.js";
import { scheduleJobs } from "../utils/job-schedulers/job-scheduler.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.json());
// app.use(helmet());
// app.use((req, res, next) => {
//   res.setHeader("X-XSS-Protection", "1; mode=block");
//   next();
// });

app.get("/", (req, res) => {
  return res.send("Service is available...");
});

app.use("/api/v1", router);
app.use(ResHandler);
scheduleJobs();
export { app };
