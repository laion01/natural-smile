import type { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";

import path from "path";

import multer from "multer";

import { OpenAI } from "openai";
import { File } from "fetch-blob/from.js";

// Configure multer to save file temporarily
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory, not in /tmp
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});


// Disable default body parsing to use multer
export const config = {
  api: {
    bodyParser: false,
  },
};

// Run middleware manually
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: any,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("image"));

    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // const imagePath = path.resolve(file.path);
    // const imageBuffer = fs.readFileSync(imagePath);

    // const imageFile = new File([imageBuffer], file.originalname, {
    //   type: "image/png",
    // });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const response = await openai.images.edit({
      model: "dall-e-2",
      prompt:
        "Enhance the teeth in this selfie. Keep the original smile, facial expression, lighting, skin tone, and background exactly the same. Only improve the teeth by whitening, aligning, and making them look naturally beautiful and realistic. Do not modify any other part of the image.",
      image: file.buffer as any,
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return res.status(500).json({ error: "Failed to generate image" });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}
