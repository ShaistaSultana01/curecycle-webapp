import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs";

// ---------- Helpers ----------
const cleanText = (text = "") =>
  text
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/\s+/g, " ")
    .trim();

const extractExpiry = (text) => {
  const patterns = [
    /ear[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
    /exp[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
    /expiry[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
    /use before[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return match[1];
  }
  return "";
};

// 🔧 FIX #1: removed dead code after `return ""`.
const extractMfg = (text) => {
  const patterns = [
    /med[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
    /mfg[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
    /mfd[:.\s\-]*([0-9]{2}\/[0-9]{4})/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return match[1];
  }
  return "";
};

const extractMedicineName = (text) => {
  if (/livogen/i.test(text)) return "Livogen";
  if (/paracetamol/i.test(text)) return "Paracetamol";
  if (/dolo/i.test(text)) return "Dolo";
  if (/crocin/i.test(text)) return "Crocin";
  const words = text.split(" ").filter(Boolean);
  return words.slice(0, 3).join(" ");
};

// ---------- Controller ----------
const scanOCR = async (req, res) => {
  let inputPath = "";
  let img0 = "";
  let img90 = "";

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    inputPath = req.file.path;
    const ts = Date.now();

    img0 = `uploads/ocr-${ts}.png`;
    img90 = `uploads/ocr-90-${ts}.png`;

    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen()
      .resize({ width: 1800, withoutEnlargement: true })
      .toFile(img0);

    await sharp(inputPath)
      .rotate(90)
      .grayscale()
      .normalize()
      .sharpen()
      .resize({ width: 1800, withoutEnlargement: true })
      .toFile(img90);

    const [r0, r90] = await Promise.all([
      Tesseract.recognize(img0, "eng"),
      Tesseract.recognize(img90, "eng"),
    ]);

    const text0 = cleanText(r0.data.text);
    const text90 = cleanText(r90.data.text);
    const combined = `${text0} ${text90}`;

    return res.status(200).json({
      success: true,
      data: {
        medicineName: extractMedicineName(combined),
        expiryDate: extractExpiry(combined),
        mfgDate: extractMfg(combined),
        rawText: text0,
        rotatedText: text90,
      },
    });
  } catch (error) {
    console.error("scanOCR error:", error);
    return res
      .status(500)
      .json({ success: false, message: "OCR failed" });
  } finally {
    // 🔧 FIX #7: always clean up uploaded + temp files
    [inputPath, img0, img90].forEach((p) => {
      try {
        if (p && fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
    });
  }
};

export { scanOCR };
