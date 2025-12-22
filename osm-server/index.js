import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// monta TODAS las rutas
app.use("/", routes);

// health check
app.get("/", (req, res) => {
  res.json({ status: "OSM server running" });
});

app.listen(3000, () => {
  console.log("OSM server running on http://localhost:3000");
});
