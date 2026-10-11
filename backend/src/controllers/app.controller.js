import { getBootstrap } from "../services/bootstrap.service.js";


// endpoint Get base
export async function bootstrap(req, res) {
  try {
    const data = await getBootstrap();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}