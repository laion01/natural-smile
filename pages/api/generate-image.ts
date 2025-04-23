import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { File } from "fetch-blob/from.js"

// Configure multer to save file temporarily
const upload = multer({
  dest: '/tmp',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'));
    }
  },
});

// Disable default body parsing to use multer
export const config = {
  api: {
    bodyParser: false,
  },
};

// Run middleware manually
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware to get uploaded image
    await runMiddleware(req, res, upload.single('image'));

    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    // Optional: mask.png should be the same size as the image with a transparent area to edit
    // const maskPath = path.resolve('./public/mask.png'); // Ensure you have a suitable transparent PNG mask
    // Use DALL·E API to edit the image
    // console.log(file.path)

    const imagePath = path.resolve(file.path);
    const { File } = await import('fetch-blob/from.js');
    const imageFile = new File(
      [fs.readFileSync(imagePath)],
      file.path,
      { type: 'image/png' }
    );

    console.log(fs.readFileSync(imagePath), imagePath)
      
    // Init OpenAI
    const openai = new OpenAI({
      apiKey: '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',
    });

    const response = await openai.images.edit({
      model: "GPT-4o",
      prompt: "Enhance the teeth in this selfie. Keep the original smile, facial expression, lighting, skin tone, and background exactly the same. Only improve the teeth by whitening, aligning, and making them look naturally beautiful and realistic. Do not modify any other part of the image.",
      image: imageFile,
    });

    console.log(response.data)
    const imageUrl = response.data[0].url;
    if (!imageUrl) {0
      return res.status(500).json({ error: 'Failed to generate image' });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (err: any) {
    console.error('Error generating image:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
