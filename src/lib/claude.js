export async function callClaude(systemPrompt, userPrompt, maxTokens = 4000, model = 'claude-sonnet-4-20250514') {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export function parseClaudeJSON(text) {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // ignore, try other methods
  }

  // Try to find a complete JSON object in the text
  try {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch {
    // ignore, try repair
  }

  // Try to repair truncated JSON (common when max_tokens is hit)
  try {
    return repairJSON(cleaned);
  } catch {
    // Try to extract structured fields from raw text before giving up
    console.error('Failed to parse Claude JSON, attempting text extraction. Raw text starts with:', cleaned.substring(0, 200));
    const rawText = cleaned.replace(/[{}"\[\]]/g, '').trim();

    // Try to extract personality/personalitySections, dashaInterpretation from raw text
    const personalityMatch = rawText.match(/(?:personality|personalitySections)\s*:\s*([\s\S]*?)(?=dashaInterpretation\s*:|yogas\s*:|$)/i);
    const dashaMatch = rawText.match(/dashaInterpretation\s*:\s*([\s\S]*?)(?=yogas\s*:|$)/i);

    const personalityText = personalityMatch ? personalityMatch[1].trim() : rawText || 'Unable to parse response.';

    return {
      personality: personalityText,
      personalitySections: null,
      dashaInterpretation: dashaMatch ? dashaMatch[1].trim() : '',
      yogas: [],
    };
  }
}

function repairJSON(text) {
  // Remove any leading/trailing non-JSON chars
  let json = text;
  const startIdx = json.indexOf('{');
  if (startIdx === -1) throw new Error('No JSON object found');
  json = json.substring(startIdx);

  // Try to close unclosed strings and brackets
  // Count open braces/brackets
  let inString = false;
  let escaped = false;
  let braces = 0;
  let brackets = 0;
  let lastGoodIndex = 0;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') braces++;
    if (ch === '}') { braces--; if (braces === 0) lastGoodIndex = i; }
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  // If we found a complete top-level object, use it
  if (lastGoodIndex > 0) {
    return JSON.parse(json.substring(0, lastGoodIndex + 1));
  }

  // Otherwise, try to close the JSON
  let repaired = json;
  if (inString) repaired += '"';
  // Close any trailing comma situations
  repaired = repaired.replace(/,\s*$/, '');
  while (brackets > 0) { repaired += ']'; brackets--; }
  while (braces > 0) { repaired += '}'; braces--; }

  return JSON.parse(repaired);
}
