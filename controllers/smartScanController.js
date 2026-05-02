import Tesseract from "tesseract.js";
import fs from "fs";

const extractExpiryAdvanced = (text) => {
  // 1. Direct EXP detection
  const expMatch = text.match(/EXP[^0-9]*([0-9]{2}\/[0-9]{4})/i);
  if (expMatch) return expMatch[1];

  // 2. Any MM/YYYY in valid year range
  const matches = text.match(/\b[0-9]{2}\/[0-9]{4}\b/g);
  if (!matches) return "";

  const valid = matches.find((date) => {
    const year = parseInt(date.split("/")[1], 10);
    return year >= 2020 && year <= 2035;
  });

  return valid || "";
};

const smartScan = async (req, res) => {
  const file = req.file;
  try {
    const { barcode } = req.body;

    let ocrText = "";
    let expiryFromOCR = "";
    let expiryFromBarcode = "";

    if (file) {
      const result = await Tesseract.recognize(file.path, "eng");
      ocrText = result.data.text;
      expiryFromOCR = extractExpiryAdvanced(ocrText);
    }

    if (barcode) {
      expiryFromBarcode = extractExpiryAdvanced(barcode);
    }

    // 🔧 FIX #2: barcode-first priority via else-if (no longer overrides OCR
    // unconditionally). Single source of truth for `source`.
    let finalExpiry = "Not Found";
    let source = "none";

    if (expiryFromBarcode) {
      finalExpiry = expiryFromBarcode;
      source = "barcode";
    } else if (expiryFromOCR) {
      finalExpiry = expiryFromOCR;
      source = "ocr";
    }

    res.json({
      success: true,
      data: {
        expiryDate: finalExpiry,
        source,
        rawText: ocrText,
      },
    });
  } catch (error) {
    console.error("smartScan error:", error);
    res.status(500).json({ success: false, message: "Smart scan failed" });
  } finally {
    // 🔧 FIX #7: clean up uploaded file
    if (file?.path) {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch {}
    }
  }
};

export { smartScan };
