import express from "express";
import { Client } from "@gradio/client";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const GRADIO_URL = process.env.GRADIO_URL;

if (!GRADIO_URL) {
  console.error("Missing GRADIO_URL. Example:");
  console.error("GRADIO_URL=https://abc123.gradio.live npm start");
  process.exit(1);
}

let gradioClient = null;

async function getClient() {
  if (!gradioClient) {
    gradioClient = await Client.connect(GRADIO_URL);
  }
  return gradioClient;
}

app.post("/api/gpu", async (req, res) => {
  try {
    const { prompt, power } = req.body;

    const client = await getClient();

    const result = await client.predict("/gpu", [
      prompt || "hello from phone",
      Number(power || 2)
    ]);

    res.json({
      ok: true,
      result: result.data[0]
    });
  } catch (err) {
    gradioClient = null;
    res.status(500).json({
      ok: false,
      error: String(err)
    });
  }
});

app.listen(3000, () => {
  console.log("Phone UI running on port 3000");
  console.log("Backend:", GRADIO_URL);
});
