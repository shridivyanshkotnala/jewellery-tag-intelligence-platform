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
    const parsedData = JSON.parse(responseText);
    
    console.log("=== AI RAW RESPONSE ===");
    console.log(JSON.stringify(parsedData, null, 2));
    console.log("=======================");

    // Add backward compatibility for frontend by flattening the first stone
    if (parsedData.structuredData) {
      if (parsedData.structuredData.diamonds && parsedData.structuredData.diamonds.length > 0) {
        // Explicitly Enforce IJ Diamond Rate Rule to fix LLM failures
        parsedData.structuredData.diamonds.forEach(dia => {
          const colorVal = dia.color?.value;
          if (colorVal && String(colorVal).toUpperCase().includes('IJ')) {
             dia.rate = { value: '20000', confidence: 100 };
          }
        });

        const firstDia = parsedData.structuredData.diamonds[0];
        parsedData.structuredData.diamondWeight = firstDia.weight || { value: '', confidence: 0 };
        parsedData.structuredData.diamondPieces = firstDia.pieces || { value: '', confidence: 0 };
        parsedData.structuredData.diamondRate = firstDia.rate || { value: '', confidence: 0 };
        parsedData.structuredData.diamondQuality = firstDia.quality || { value: '', confidence: 0 };
        parsedData.structuredData.diamondColor = firstDia.color || { value: '', confidence: 0 };
        parsedData.structuredData.diamondClarity = firstDia.clarity || { value: '', confidence: 0 };
      }

      if (parsedData.structuredData.colorstones && parsedData.structuredData.colorstones.length > 0) {
        const firstCs = parsedData.structuredData.colorstones[0];
        parsedData.structuredData.coloredStoneWeight = firstCs.weight || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStonePieces = firstCs.pieces || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneRate = firstCs.rate || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneQuality = firstCs.quality || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneColor = firstCs.color || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneClarity = firstCs.clarity || { value: '', confidence: 0 };
      }
    }

    return parsedData;
  } catch (err) {
    console.error('[OpenAI Error]', err);
    return { error: 'OpenAI API failed', raw: err.message };
  }
};

module.exports = { analyzeImages };
