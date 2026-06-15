const { v4: uuidv4 } = require('uuid');
const redisService = require('./redis.service');
const geminiService = require('./gemini.service');

const createScan = async (jewelleryType, scanType) => {
  const scanId = uuidv4();
  const scanData = {
    scanId,
    status: 'WAITING_FOR_SCAN',
    jewelleryType,
    scanType,
    createdAt: new Date().toISOString()
  };
  await redisService.setScan(scanId, scanData);
  return scanData;
};

const saveImage = async (scanId, imagePath, type) => {
  const statusMap = {
    front: 'FRONT_IMAGE_RECEIVED',
    back: 'BACK_IMAGE_RECEIVED'
  };
  return await redisService.updateScanStatus(scanId, statusMap[type], {
    [`${type}ImagePath`]: imagePath
  });
};

const analyzeScan = async (scanId) => {
  const scan = await redisService.getScan(scanId);
  if (!scan) throw new Error('Scan not found');

  const { frontImagePath, backImagePath, jewelleryType, scanType } = scan;

  const result = await geminiService.analyzeImages(frontImagePath, backImagePath, jewelleryType, scanType);
  
  return await redisService.updateScanStatus(scanId, 'ANALYSIS_COMPLETED', {
    analysisResult: result
  });
};

const getAvailableFieldsForJewelleryType = (jewelleryType) => {
  const common = ['grossWeight', 'netWeight', 'purity', 'labour', 'other'];

  const stoneFieldsByType = {
    DIAMOND: ['diamondWeight', 'diamondRate', 'diamondQuality', 'diamondPieces'],
    GOLD: ['goldWeight', 'goldRate', 'goldQuality', 'goldPieces'],
    SILVER: ['silverWeight', 'silverRate', 'silverQuality', 'silverPieces'],
    COLOUR_STONE: [
      'coloredStoneWeight',
      'coloredStoneRate',
      'coloredStoneQuality',
      'coloredStonePieces',
    ],
  };

  const stoneFields = stoneFieldsByType[jewelleryType] || stoneFieldsByType.DIAMOND;
  return [...common, ...stoneFields];
};

const getClarification = async (scanId) => {
  const scan = await redisService.getScan(scanId);
  if (!scan || !scan.analysisResult) throw new Error('Scan analysis not found');

  const fieldsNeedingReview = [];
  
  const defaultAvailableFields = getAvailableFieldsForJewelleryType(scan.jewelleryType || 'DIAMOND');

  const unknownFields = scan.analysisResult.unknownFields || [];
  const structuredData = scan.analysisResult.structuredData || {};
  
  const extractedValues = new Set();
  for (const field of Object.values(structuredData)) {
      if (field.value) {
          const val = field.value.toString().trim().toLowerCase();
          extractedValues.add(val);
          const match = val.match(/^(\d+(\.\d+)?)/);
          if (match) {
              extractedValues.add(match[1]);
          }
      }
  }

  const isIdentifier = (val, abbr, suggested) => {
      if (/identifier|product id|barcode|code/i.test(abbr) || /identifier|product id|barcode|code/i.test(suggested)) return true;
      if (val) {
          if (/^[A-Z0-9]{7,}$/i.test(val)) return true; // e.g. GR01496B, 25LDGR272483929
          if (/^\d{4,}$/.test(val)) return true; // e.g. 1671
          if (abbr === 'Unidentified' && val.length === 1 && /[a-zA-Z]/i.test(val)) return true; // e.g. 'g'
      }
      return false;
  };

  for (const uf of unknownFields) {
    const abbr = (uf.abbreviation || "").trim();
    const val = (uf.detectedValue || "").trim();
    const suggested = (uf.suggestedMeaning || "").trim();
    
    // 4. Empty abbreviations are not allowed.
    if (!abbr) continue;
    
    // 1 & 2. Ignore Product IDs, Barcodes, Item codes, Random numbers
    if (isIdentifier(val, abbr, suggested)) continue;
    
    // Ignore values already extracted with high confidence
    if (val && extractedValues.has(val.toLowerCase())) continue;
    
    // Handle split numbers (e.g. "10 14") where all parts are already extracted
    if (abbr === 'Unidentified' && val) {
        const parts = val.split(/\s+/);
        const allPartsExtracted = parts.length > 0 && parts.every(p => extractedValues.has(p.toLowerCase()));
        if (allPartsExtracted) continue;
    }

    // 3. suggestedField must contain a valid field key from availableFields
    let mappedSuggestedField = "other";
    if (suggested) {
        const exactMatch = defaultAvailableFields.find(af => af.toLowerCase() === suggested.toLowerCase());
        if (exactMatch) {
            mappedSuggestedField = exactMatch;
        } else {
            const partialMatch = defaultAvailableFields.find(af => suggested.toLowerCase().includes(af.toLowerCase()));
            if (partialMatch) mappedSuggestedField = partialMatch;
        }
    }

    fieldsNeedingReview.push({
      abbreviation: abbr,
      detectedValue: val,
      suggestedField: mappedSuggestedField,
      confidence: uf.confidence || 0,
      availableFields: defaultAvailableFields
    });
  }
  
  // added structuredData fields that have low confidence
  for (const [key, field] of Object.entries(structuredData)) {
    if (field.confidence < 80 && field.value) {
      const exists = fieldsNeedingReview.find(f => f.abbreviation === key);
      if (!exists) {
          fieldsNeedingReview.push({
             abbreviation: key,
             detectedValue: field.value,
             suggestedField: defaultAvailableFields.includes(key) ? key : "other",
             confidence: field.confidence,
             availableFields: defaultAvailableFields
          });
      }
    }
  }

  return {
    scanId,
    fieldsNeedingReview
  };
};

const applyClarificationMappings = (analysisResult, confirmedMappings) => {
  if (!analysisResult || !Array.isArray(confirmedMappings)) {
    return analysisResult;
  }

  const structuredData = { ...(analysisResult.structuredData || {}) };
  const unknownFields = analysisResult.unknownFields || [];

  for (const mapping of confirmedMappings) {
    if (!mapping?.mappedField || mapping.mappedField === 'other') {
      continue;
    }

    const unknown = unknownFields.find((uf) => uf.abbreviation === mapping.abbreviation);
    const detectedValue = (unknown?.detectedValue || '').trim();
    if (!detectedValue) {
      continue;
    }

    structuredData[mapping.mappedField] = {
      value: detectedValue,
      confidence: 100,
    };
  }

  return {
    ...analysisResult,
    structuredData,
  };
};

const submitClarification = async (scanId, confirmedMappings) => {
  const scan = await redisService.getScan(scanId);
  if (!scan?.analysisResult) {
    throw new Error('Scan analysis not found');
  }

  const updatedAnalysis = applyClarificationMappings(scan.analysisResult, confirmedMappings);

  await redisService.updateScanStatus(scanId, 'CLARIFICATION_COMPLETED', {
    clarifications: confirmedMappings,
    analysisResult: updatedAnalysis,
  });
};

const getReviewData = async (scanId) => {
   const scan = await redisService.getScan(scanId);
   if (!scan || !scan.analysisResult) throw new Error('Scan not found');

   const structuredData = {};
   const rawStruct = scan.analysisResult.structuredData || {};
   for (const [k, v] of Object.entries(rawStruct)) {
     const value = v?.value;
     if (value != null && String(value).trim() !== '') {
       structuredData[k] = String(value);
     }
   }

   const updated = await redisService.updateScanStatus(scanId, 'READY_FOR_REVIEW', {
       finalData: structuredData
   });

   return {
       scanId,
       status: updated.status,
       structuredData
   };
};

const submitReview = async (scanId, finalData) => {
    await redisService.updateScanStatus(scanId, 'APPROVED', {
        finalData
    });
};

module.exports = {
  createScan,
  saveImage,
  analyzeScan,
  getClarification,
  submitClarification,
  getReviewData,
  submitReview
};
