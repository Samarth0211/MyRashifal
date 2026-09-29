require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.CLAUDE_API_KEY;
const EN_FILE = path.join(__dirname, "../src/translations/en.js");
const MR_FILE = path.join(__dirname, "../src/translations/mr.js");

// Read en.js, extract the object
function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  // Extract just the object contents between first { and last }
  const match = content.match(/=\s*\{([\s\S]*)\};\s*$/m);
  if (!match) throw new Error("Could not parse " + filePath);
  // Parse key-value pairs
  const pairs = {};
  const regex = /"([^"]+)":\s*"([^"]*)"/g;
  let m;
  while ((m = regex.exec(match[1])) !== null) {
    pairs[m[1]] = m[2];
  }
  return pairs;
}

async function translateBatch(enPairs, batchKeys) {
  const batch = {};
  for (const key of batchKeys) {
    batch[key] = enPairs[key];
  }

  const prompt = `You are an expert translator specializing in Vedic astrology (Jyotish Shastra) and traditional Marathi language.

Translate the following JSON key-value pairs from English to PROPER TRADITIONAL MARATHI. Follow these rules strictly:

1. USE PROPER MARATHI WORDS, NOT English transliterations:
   - "Report" → "अहवाल" (NOT "रिपोर्ट")
   - "Save" → "जतन करा" (NOT "सेव्ह करा")
   - "Features" → "वैशिष्ट्ये" (NOT "फीचर्स")
   - "Unlock" → "मिळवा" or "उघडा" (NOT "अनलॉक करा")
   - "Feedback" → "अभिप्राय" (NOT "फीडबॅक")
   - "Subscribe" → "सदस्यत्व घ्या" (NOT "सबस्क्राइब")
   - "Loading" → "भरत आहे..." (NOT "लोड होत आहे")
   - "Tip" → "सुविचार" or "सल्ला" (NOT "टिप")
   - "Upgrade" → "श्रेणीवाढ करा" (NOT "अपग्रेड")
   - "Profile" → "माहिती" (NOT "प्रोफाइल")
   - "Premium" → "विशेष" (NOT "प्रीमियम")
   - "Free" → "विनामूल्य" or "मोफत" (both are OK, "विनामूल्य" is more formal)
   - "App" → "ॲप" (NOT "ऐप")
   - "Online/Offline" → "सक्रिय/निष्क्रिय" in context
   - "Cosmic" → "खगोलीय" or "ताऱ्यांचा"
   - "Blueprint" → "नकाशा" or "आराखडा"
   - "Rating" → "मूल्यांकन"
   - "Error" → "त्रुटी"
   - "Processing" → "प्रक्रिया सुरू आहे..."

2. For VEDIC/ASTROLOGY terms, use authentic Sanskrit-Marathi terms:
   - Use शास्त्रीय (classical), फलादेश (prediction), गणना (calculation)
   - Use ज्योतिष (astrology), ग्रह (planet), भाव (house), कुंडली (chart)
   - Use दशा, अंतर्दशा, गोचर, नक्षत्र, तिथी, अयनांश — these are correct
   - "Personality analysis" → "व्यक्तिमत्त्व विश्लेषण"
   - "Prediction" → "फलादेश" or "भविष्यकथन"
   - "Compatibility" → "सुसंगतता" or "गुण जुळवणी"

3. Keep these as-is (universally understood): Google, WhatsApp, PDF, AI, ₹, IST, MyRashifal+, Brihat Parashara Hora Shastra, Phaladeepika, Saravali

4. The tone should be respectful and traditional — like a ज्योतिषी (astrologer) speaking to a client. Use "तुमचे/तुमची" (respectful you), not "तुझे/तुझी".

5. Keep the same {placeholder} variables exactly as in English (like {name}, {amount}, {count}, etc.)

6. Do NOT add any emojis that weren't in the original English text. Keep existing emojis (✨, ←, →) as-is.

Return ONLY a valid JSON object with the same keys and Marathi values. No explanation, no markdown, just the JSON.

English pairs to translate:
${JSON.stringify(batch, null, 2)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text.trim();

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  return JSON.parse(jsonStr);
}

async function main() {
  console.log("Reading English translations...");
  const enPairs = parseTranslationFile(EN_FILE);
  const allKeys = Object.keys(enPairs);
  console.log(`Found ${allKeys.length} keys to translate.\n`);

  // Split into batches of ~50 keys (to stay within context limits)
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    batches.push(allKeys.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${batches.length} batches...\n`);
  const mrPairs = {};

  for (let i = 0; i < batches.length; i++) {
    console.log(`Batch ${i + 1}/${batches.length} (${batches[i].length} keys)...`);
    try {
      const translated = await translateBatch(enPairs, batches[i]);
      Object.assign(mrPairs, translated);
      console.log(`  ✓ Done`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      // Fallback: keep English for failed batch
      for (const key of batches[i]) {
        mrPairs[key] = enPairs[key];
      }
    }
    // Small delay between batches
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Build the output file
  let output = "const mr = {\n";
  // Preserve the comment structure from English file
  const enContent = fs.readFileSync(EN_FILE, "utf-8");
  const lines = enContent.split("\n");

  for (const line of lines) {
    const commentMatch = line.match(/^\s*(\/\/.*)/);
    if (commentMatch) {
      output += `  ${commentMatch[1]}\n`;
      continue;
    }
    const kvMatch = line.match(/^\s*"([^"]+)":\s*"[^"]*"(,?)\s*$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const comma = kvMatch[2];
      const value = (mrPairs[key] || enPairs[key]).replace(/"/g, '\\"');
      output += `  "${key}": "${value}"${comma}\n`;
      continue;
    }
    // Empty lines
    if (line.trim() === "") {
      output += "\n";
      continue;
    }
  }

  // Clean up: remove the const/export wrapper from en.js structure
  // and write our own
  output = "const mr = {\n";
  let currentComment = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      currentComment = `  ${trimmed}\n`;
      output += currentComment;
    } else if (trimmed.startsWith('"')) {
      const kvMatch = trimmed.match(/^"([^"]+)":\s*"[^"]*"(,?)\s*$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const comma = kvMatch[2];
        const val = mrPairs[key] || enPairs[key];
        // Escape any unescaped quotes in the value
        const escaped = val.replace(/(?<!\\)"/g, '\\"');
        output += `  "${key}": "${escaped}"${comma}\n`;
      }
    } else if (trimmed === "") {
      output += "\n";
    }
  }

  output += "};\n\nexport default mr;\n";

  // Write output
  fs.writeFileSync(MR_FILE, output, "utf-8");
  console.log(`\n✓ Written ${Object.keys(mrPairs).length} translations to ${MR_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
