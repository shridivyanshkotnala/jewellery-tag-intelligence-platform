const OpenAI = require('openai');
const sharp = require('sharp');
const config = require('../config/env');
const fs = require('fs');
const { SYSTEM_PROMPT, getUserPrompt } = require('../prompts/openai.prompt');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Compress and resize image before sending to OpenAI
const processImageToBase64 = async (filePath) => {
  const compressedBuffer = await sharp(filePath)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return compressedBuffer.toString('base64');
};

const analyzeImages = async (frontImagePath, backImagePath, jewelleryType, scanType, scannerSettings = {}) => {
  // Process images in parallel
  const [frontBase64, backBase64] = await Promise.all([
    frontImagePath && fs.existsSync(frontImagePath) ? processImageToBase64(frontImagePath) : null,
    backImagePath && fs.existsSync(backImagePath) ? processImageToBase64(backImagePath) : null,
  ]);

  const userContent = [{ type: 'text', text: getUserPrompt(jewelleryType, scanType, scannerSettings) }];

  if (frontBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${frontBase64}` },
    });
  }

  if (backBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${backBase64}` },
    });
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Flagship model for maximum intelligence
      messages: messages,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const responseText = response.choices[0].message.content;
    return JSON.parse(responseText);
  } catch (err) {
    console.error('[OpenAI Error]', err);
    return { error: 'OpenAI API failed', raw: err.message };
  }
};

module.exports = { analyzeImages };
