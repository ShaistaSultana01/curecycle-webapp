// Real barcode → product lookup using OpenFoodFacts (100% free, no API key).
// Coverage is best for packaged consumer goods. For pharmaceuticals it works
// for over-the-counter products with international barcodes (Crocin, Dolo,
// Paracetamol packs, etc.) but not all prescription drugs.

const OFF_URL = (code) =>
  `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`;

const detectRegion = (code) => {
  if (/^890/.test(code)) return "India";
  if (/^00[0-9]/.test(code) || /^0[1-9]/.test(code)) return "USA/Canada";
  if (/^4[0-9]/.test(code)) return "Germany";
  if (/^50/.test(code)) return "United Kingdom";
  return "Unknown";
};

const barcodeLookup = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res
        .status(400)
        .json({ success: false, message: "Barcode is required" });
    }

    const region = detectRegion(barcode);

    let productName = "";
    let brand = "";
    let imageUrl = "";
    let category = "";
    let source = "none";

    // 🔎 Query OpenFoodFacts
    try {
      const r = await fetch(OFF_URL(barcode), {
        headers: { "User-Agent": "CureCycle/1.0 (medicine-tracker)" },
      });
      if (r.ok) {
        const json = await r.json();
        if (json?.status === 1 && json.product) {
          productName =
            json.product.product_name ||
            json.product.generic_name ||
            "";
          brand = json.product.brands || "";
          imageUrl =
            json.product.image_front_url || json.product.image_url || "";
          category = json.product.categories || "";
          source = "openfoodfacts";
        }
      }
    } catch (e) {
      console.warn("OpenFoodFacts lookup failed:", e.message);
    }

    res.json({
      success: true,
      data: {
        barcode,
        region,
        medicineName: productName,
        brand,
        category,
        imageUrl,
        expiryDate: "", // barcodes don't encode expiry
        source,
        note: productName
          ? "Product matched. Use OCR (/api/scan/ocr) to read printed expiry date."
          : "Product not found in OpenFoodFacts. Use OCR to extract details from the package.",
      },
    });
  } catch (error) {
    console.error("barcodeLookup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Barcode lookup failed" });
  }
};

export { barcodeLookup };
