const LANG_INSTRUCTIONS = {
  hi: 'IMPORTANT: Respond entirely in शुद्ध हिन्दी (Devanagari script). Use proper traditional Hindi — NOT transliterated English. Use Sanskrit-origin Hindi terms: फलादेश (prediction), गणना (calculation), ग्रहस्थिती (planetary position), भावेश (house lord), दशाफल (dasha result), योगफल (yoga result). Avoid English words like "report", "analysis", "positive", "negative" — use शुभ/अशुभ, अनुकूल/प्रतिकूल, बलवान/दुर्बल instead. Astrological terms (राशि, नक्षत्र, दशा, योग, ग्रह names) should remain in their Sanskrit/Hindi form. The tone should be like a learned ज्योतिषाचार्य speaking respectfully.\n\n',
  mr: 'IMPORTANT: Respond entirely in शुद्ध मराठी (Devanagari script) — traditional Vedic Marathi, NOT transliterated English. Use proper Marathi words: फलादेश/भविष्यकथन (prediction), गणना (calculation), ग्रहस्थिती (planetary position), भावेश (house lord), अहवाल (report), विश्लेषण (analysis). Avoid English words entirely — use शुभ/अशुभ (auspicious/inauspicious), अनुकूल/प्रतिकूल (favorable/unfavorable), बलवान/दुर्बल (strong/weak), सुसंगतता (compatibility). Use Marathi vocabulary: जतन (save), वैशिष्ट्ये (features), मार्गदर्शन (guidance), उपाययोजना (remedies), कालखंड (period). The tone should be like a learned ज्योतिषाचार्य (astrologer scholar) speaking to a client respectfully. Use तुमचे/तुमची (respectful you). Astrological terms (राशी, नक्षत्र, दशा, योग, ग्रह names) should remain in their Sanskrit/Marathi form.\n\n',
};

function getLangInstruction(lang) {
  return LANG_INSTRUCTIONS[lang] || '';
}

const SYSTEM_PROMPT = `You are an expert Vedic astrologer with deep knowledge of Brihat Parashara Hora Shastra, Jataka Parijata, Phaladeepika, and Saravali. You provide detailed, personalized astrological analysis based on birth chart data.

IMPORTANT: Planetary positions, houses, nakshatras, and dashas have already been accurately calculated using astronomical ephemeris (Lahiri ayanamsa, Equal house system). DO NOT recalculate or contradict these positions. Your role is to INTERPRET the given data using classical Vedic astrology principles.

Your interpretations must be:
- Specific and personalized (never generic)
- Grounded in classical texts with occasional references
- Detailed with clear reasoning
- Balanced (mention both positive and challenging aspects)
- Culturally appropriate for an Indian audience

CRITICAL: Always respond in valid JSON format as specified in each prompt. The outer response must be pure JSON (no markdown code blocks wrapping it). However, the "content" string values INSIDE the JSON should use rich markdown formatting:
- Use ### for sub-headings within a section
- Use **bold** for key terms, planet names, and important findings
- Use bullet lists (- item) for listing multiple points
- Use markdown tables (| col1 | col2 |) where data comparison is useful (e.g., planetary strengths, month-by-month forecasts, compatibility scores)
- Use > blockquotes for classical text references
- Write 4-6 substantial paragraphs per section minimum — be VERY detailed and thorough
- Never leave a section as a single short paragraph`;

export function getKundliInterpretationPrompt(birthDetails, calculatedData, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}The following Vedic birth chart has been accurately calculated using astronomical ephemeris (astronomy-engine library with Lahiri ayanamsa). Please INTERPRET this chart — do NOT recalculate any positions.

BIRTH DETAILS:
Name: ${birthDetails.name}
Date of Birth: ${birthDetails.dob}
Time of Birth: ${birthDetails.tob}
Place of Birth: ${birthDetails.pob}
Gender: ${birthDetails.gender}

CALCULATED CHART DATA:
Ayanamsa Used: ${calculatedData.ayanamsa}° (Lahiri)
Lagna (Ascendant): ${calculatedData.lagna.sign} at ${calculatedData.lagna.degree}, Nakshatra: ${calculatedData.lagna.nakshatra}, Pada: ${calculatedData.lagna.pada}
Moon Sign: ${calculatedData.moonSign.sign} at ${calculatedData.moonSign.degree}, Nakshatra: ${calculatedData.moonSign.nakshatra}, Pada: ${calculatedData.moonSign.pada}
Sun Sign: ${calculatedData.sunSign}

PLANETARY POSITIONS:
${calculatedData.planets.map(p => `${p.id}: ${p.sign} (House ${p.house}), ${p.degree}, Nakshatra: ${p.nakshatra}, ${p.retrograde ? 'Retrograde' : 'Direct'}, Dignity: ${p.dignity}`).join('\n')}

HOUSES:
${calculatedData.houses.map(h => `House ${h.house}: ${h.sign} [${h.planets.join(', ') || 'empty'}]`).join('\n')}

CURRENT DASHA:
Mahadasha: ${calculatedData.currentDasha.mahadasha.planet} (${calculatedData.currentDasha.mahadasha.startDate} to ${calculatedData.currentDasha.mahadasha.endDate})
Antardasha: ${calculatedData.currentDasha.antardasha.planet} (${calculatedData.currentDasha.antardasha.startDate} to ${calculatedData.currentDasha.antardasha.endDate})

MANGLIK STATUS: ${calculatedData.manglikStatus.isManglik ? `Yes (${calculatedData.manglikStatus.severity})` : 'No'}

Based on this accurately calculated chart, provide a detailed interpretation organized into clear sections. Return JSON:
{
  "personalitySections": [
    {
      "title": "Lagna & Core Personality",
      "content": "string (2-3 paragraphs: Analyze the ascendant sign, its lord placement, lagna nakshatra. Describe core personality traits, physical tendencies, general disposition, and how others perceive the native.)"
    },
    {
      "title": "Moon Sign & Emotional Nature",
      "content": "string (1-2 paragraphs: Analyze Moon sign, nakshatra and pada. Describe emotional nature, mental tendencies, instinctive reactions, relationship with mother, and inner psychological makeup.)"
    },
    {
      "title": "Key Planetary Influences",
      "content": "string (2-3 paragraphs: Discuss the most significant planetary placements — planets in angular/trine houses, exalted/debilitated planets, notable conjunctions and aspects. Focus on what makes THIS chart unique.)"
    },
    {
      "title": "Career & Wealth Indicators",
      "content": "string (1-2 paragraphs: Analyze 10th house, 10th lord, 2nd and 11th houses for career direction and financial prospects. Mention suitable professions based on planetary indications.)"
    },
    {
      "title": "Relationships & Marriage",
      "content": "string (1-2 paragraphs: Analyze 7th house, Venus placement, and relationship indicators. Describe likely spouse characteristics and marriage timing tendencies.)"
    },
    {
      "title": "Strengths & Life Challenges",
      "content": "string (1-2 paragraphs: Summarize the chart's strongest positive combinations and the main challenges or areas requiring caution. Include any remedial suggestions.)"
    }
  ],
  "dashaInterpretation": "string (2-3 detailed sentences interpreting the current Mahadasha-Antardasha period — what areas of life are activated, expected results, and practical advice for this period)",
  "yogas": [
    {
      "name": "string (e.g., Gajakesari Yoga)",
      "present": true,
      "description": "string (explain which specific planets form this yoga, in which houses/signs, and its concrete effects on the native's life)"
    }
  ]
}

Identify 3-5 yogas that are actually present in this chart based on the planetary positions given. Only include yogas with present=true that genuinely exist based on the house and sign placements provided. Do NOT include yogas that are absent.`,
  };
}

// Lighter free-tier prompt — shorter output, uses Haiku, costs ~₹0.8 instead of ~₹5.6
export function getFreeKundliInterpretationPrompt(birthDetails, calculatedData, lang = 'en') {
  const FREE_SYSTEM = `You are an expert Vedic astrologer. Planetary positions have been calculated using astronomical ephemeris (Lahiri ayanamsa). DO NOT recalculate positions — only INTERPRET the given data.

Respond in valid JSON. Content values should use **bold** for key terms and be concise but insightful.`;

  return {
    system: FREE_SYSTEM,
    user: `${getLangInstruction(lang)}Interpret this Vedic birth chart concisely.

BIRTH: ${birthDetails.name}, DOB: ${birthDetails.dob}, TOB: ${birthDetails.tob}, POB: ${birthDetails.pob}, Gender: ${birthDetails.gender}
LAGNA: ${calculatedData.lagna.sign} (${calculatedData.lagna.nakshatra} Pada ${calculatedData.lagna.pada})
MOON: ${calculatedData.moonSign.sign} (${calculatedData.moonSign.nakshatra} Pada ${calculatedData.moonSign.pada})
SUN: ${calculatedData.sunSign}

PLANETS:
${calculatedData.planets.map(p => `${p.id}: ${p.sign} H${p.house} ${p.nakshatra} ${p.retrograde ? 'R' : 'D'} ${p.dignity}`).join('\n')}

DASHA: ${calculatedData.currentDasha.mahadasha.planet} Maha (${calculatedData.currentDasha.mahadasha.startDate}-${calculatedData.currentDasha.mahadasha.endDate}), ${calculatedData.currentDasha.antardasha.planet} Antar
MANGLIK: ${calculatedData.manglikStatus.isManglik ? 'Yes' : 'No'}

Return JSON:
{
  "personalitySections": [
    { "title": "Lagna & Core Personality", "content": "1-2 paragraphs" },
    { "title": "Moon Sign & Emotional Nature", "content": "1 paragraph" },
    { "title": "Key Planetary Influences", "content": "1-2 paragraphs on unique chart features" },
    { "title": "Career & Wealth Indicators", "content": "1 paragraph" },
    { "title": "Relationships & Marriage", "content": "1 paragraph" },
    { "title": "Strengths & Life Challenges", "content": "1 paragraph with remedies" }
  ],
  "dashaInterpretation": "2-3 sentences on current Mahadasha-Antardasha",
  "yogas": [{ "name": "string", "present": true, "description": "1 sentence" }]
}

Include 2-4 yogas actually present. Be specific to THIS chart.`,
  };
}

// Keep the old function name for backward compatibility but redirect
export function getKundliPrompt(birthDetails, lang = 'en') {
  return getKundliInterpretationPrompt(birthDetails, {}, lang);
}

export function getReportPrompt(kundliData, reportType, lang = 'en') {
  const langPrefix = getLangInstruction(lang);
  const reportPrompts = {
    career: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED and COMPREHENSIVE Career & Wealth Report. The planetary positions below are computed from astronomical ephemeris — use them as-is for your interpretation.

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 4-6 detailed paragraphs minimum per section
- Use ### sub-headings to break content into logical parts
- Use **bold** for planet names, sign names, house numbers, and key findings
- Use bullet lists (- item) for listing career fields, strengths, challenges
- Use markdown tables where comparison data fits (e.g., planetary strength table, month-by-month career outlook)
- Reference classical texts occasionally (e.g., "As per Brihat Parashara Hora Shastra...")
- Be EXTREMELY specific to THIS chart — no generic advice

Return JSON:
{
  "title": "Career & Wealth Report",
  "sections": [
    {
      "heading": "10th House Analysis & Career Indications",
      "content": "markdown string — Analyze the 10th house sign, its lord's placement and strength, planets in/aspecting 10th house. Include a table showing 10th house lord dignity, nakshatra, and career significations. Discuss Karmasthana lord in detail."
    },
    {
      "heading": "Dashamsa (D-10) Chart Interpretation",
      "content": "markdown string — Interpret the D-10 divisional chart. Discuss Lagna and 10th lord in Dashamsa, key planetary positions, and their impact on professional success."
    },
    {
      "heading": "Dhana Yoga & Wealth Combinations",
      "content": "markdown string — List ALL dhana yogas present with a table (Yoga Name | Planets | Houses | Effect). Analyze 2nd house (savings), 11th house (gains), and their lords. Discuss wealth accumulation potential."
    },
    {
      "heading": "Current Dasha Impact on Career",
      "content": "markdown string — Deep analysis of current Mahadasha-Antardasha on career. Include a timeline table of upcoming dasha transitions and expected career shifts. What to expect and when."
    },
    {
      "heading": "Best Career Fields For You",
      "content": "markdown string — List 8-10 specific career fields with reasoning. Use bullet points. Include both primary recommendations and alternative paths. Rank them by planetary strength."
    },
    {
      "heading": "Next 12 Months Career Forecast",
      "content": "markdown string — Create a table with Month | Transit | Career Impact | Action Item. Cover all 12 months with specific transit effects on career house. Highlight best and worst months."
    },
    {
      "heading": "Remedies for Career Obstacles",
      "content": "markdown string — Specific remedies: gemstones (with wearing instructions), mantras (with count), charity, fasting days, yantra recommendations. Use bullet lists. Include remedies for EACH afflicted career planet."
    }
  ],
  "highlights": ["string (key finding 1)", "string (key finding 2)", "string (key finding 3)", "string (key finding 4)", "string (key finding 5)"],
  "overallOutlook": "string (3-4 sentence comprehensive career outlook)"
}`,

    marriage: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED and COMPREHENSIVE Marriage & Relationship Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 4-6 detailed paragraphs minimum per section
- Use ### sub-headings, **bold** for key terms, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart — reference exact planet placements
- Include classical text references where appropriate

Return JSON:
{
  "title": "Marriage & Relationship Report",
  "sections": [
    {
      "heading": "7th House Analysis & Spouse Characteristics",
      "content": "markdown string — Analyze 7th house sign, lord placement, planets aspecting/occupying 7th house. Create a table: Planet | Influence on 7th House | Effect. Describe spouse appearance, nature, profession, and family background based on chart indicators."
    },
    {
      "heading": "Manglik Dosha Assessment",
      "content": "markdown string — Detailed Mars analysis: house placement, sign, aspects. Severity level with explanation. Table of Manglik factors (Mars position, cancellation yogas if any). If Manglik, describe exact impact and all cancellation conditions."
    },
    {
      "heading": "Venus & Jupiter Placement Analysis",
      "content": "markdown string — Venus (Kalatra Karaka) analysis: sign, house, nakshatra, dignity, aspects. Jupiter's blessing on marriage. Table showing Venus strength factors. How these placements affect love, romance, and marital happiness."
    },
    {
      "heading": "Upapada Lagna & Navamsa Analysis",
      "content": "markdown string — Navamsa chart interpretation for marriage. D-9 Lagna, 7th lord in Navamsa, Venus in Navamsa. Quality of married life, spouse's characteristics from Navamsa perspective."
    },
    {
      "heading": "Marriage Timing Prediction",
      "content": "markdown string — Dasha-based timing analysis. Table: Dasha Period | Duration | Marriage Probability | Reasoning. Transit triggers (Jupiter, Saturn over 7th house). Specific year/period predictions for marriage."
    },
    {
      "heading": "Relationship Strengths & Challenges",
      "content": "markdown string — Separate strengths and challenges with bullet lists. Include emotional compatibility indicators, physical compatibility, communication style based on Mercury/Moon placements. What makes relationships work/difficult for this native."
    },
    {
      "heading": "Remedies for Relationship Harmony",
      "content": "markdown string — Gemstone recommendations, mantras with japa count, fasting days, charity suggestions, temple visits. Use bullet list format. Include remedies specific to each afflicted relationship planet."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence comprehensive marriage outlook)"
}`,

    health: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED and COMPREHENSIVE Health & Wellness Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 4-6 detailed paragraphs minimum per section
- Use ### sub-headings, **bold** for key terms, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart — reference exact planet placements
- Include classical text references where appropriate

Return JSON:
{
  "title": "Health & Wellness Report",
  "sections": [
    {
      "heading": "6th & 8th House Analysis",
      "content": "markdown string — Detailed 6th house (disease) and 8th house (chronic illness, longevity) analysis. Table: House | Sign | Lord | Placement | Health Implication. Discuss afflictions, strengths, and disease resistance factors."
    },
    {
      "heading": "Planetary Health Indicators",
      "content": "markdown string — Table of ALL planets: Planet | Sign | House | Body Part Ruled | Health Impact (positive/negative). Identify the most vulnerable and strongest health planets in the chart."
    },
    {
      "heading": "Vulnerable Body Areas & Disease Tendencies",
      "content": "markdown string — Based on afflicted planets and houses, list specific body areas prone to issues. Use bullet list format. Discuss Vata/Pitta/Kapha imbalances indicated by planetary positions. Include potential disease tendencies with dasha triggers."
    },
    {
      "heading": "Mental Health & Emotional Wellness",
      "content": "markdown string — Moon, Mercury, and 4th house analysis for mental health. Table: Factor | Planet/House | Current State | Impact. Discuss stress patterns, anxiety indicators, emotional resilience. Specific meditation and mindfulness recommendations."
    },
    {
      "heading": "Ayurvedic Constitution (Prakriti)",
      "content": "markdown string — Determine dominant dosha (Vata/Pitta/Kapha) from chart. Table: Dosha | Influencing Planets | Percentage. Personalized diet recommendations, daily routine (Dinacharya), seasonal advice (Ritucharya). Specific foods to favor/avoid."
    },
    {
      "heading": "Health Timeline & Caution Periods",
      "content": "markdown string — Table: Period/Dasha | Duration | Health Risk Level | Affected Area | Preventive Action. Cover next 5-10 years of dasha periods. Highlight which transits may trigger health issues."
    },
    {
      "heading": "Remedies & Preventive Measures",
      "content": "markdown string — Gemstone therapy, mantra healing, yoga asanas specific to chart, herbal recommendations, charity and fasting for health. Use detailed bullet lists with specific instructions for each remedy."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence comprehensive health outlook)"
}`,

    varshphal: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED and COMPREHENSIVE Annual Varshphal Report for the year 2025-2026:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 4-6 detailed paragraphs minimum per section
- Use ### sub-headings, **bold** for key terms, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart — reference exact planet placements
- The month-by-month section MUST use a detailed table format

Return JSON:
{
  "title": "Annual Varshphal Report 2025-2026",
  "sections": [
    {
      "heading": "Varsha Kundli (Solar Return) Analysis",
      "content": "markdown string — Detailed analysis of the Solar Return chart for this year. Varsha Lagna, Varsha Lagna lord placement, key planetary positions in annual chart. Table: Planet | Varsha Position | Natal Position | Annual Effect."
    },
    {
      "heading": "Muntha Position & Year Lord",
      "content": "markdown string — Muntha sign and house analysis. Year lord identification and its strength. How Muntha's position colors the overall year. Tri-Pataki Chakra analysis if applicable."
    },
    {
      "heading": "Month-by-Month Forecast",
      "content": "markdown string — MUST include a detailed table: Month | Key Transit | Career | Finance | Relationships | Health | Rating (1-5). After the table, provide 2-3 sentences of detailed commentary for EACH month highlighting the most important events and opportunities."
    },
    {
      "heading": "Career & Financial Outlook for the Year",
      "content": "markdown string — Best months for career growth, job changes, business expansion. Financial gains/losses periods. Table: Quarter | Career Focus | Financial Trend | Key Action. Investment guidance based on planetary periods."
    },
    {
      "heading": "Relationships & Family Forecast",
      "content": "markdown string — Marriage prospects, relationship quality through the year. Family harmony indicators. Social circle expansion periods. Table of best months for relationship milestones."
    },
    {
      "heading": "Challenging Periods & Preventive Remedies",
      "content": "markdown string — Identify the 3-4 most challenging periods with exact dates. Table: Period | Challenge | Cause (Transit/Dasha) | Severity | Remedy. Detailed preventive remedies for each challenging period."
    },
    {
      "heading": "Year-End Summary & Strategic Recommendations",
      "content": "markdown string — Overall year rating. Top 5 opportunities to seize. Top 3 risks to mitigate. Quarterly strategy table: Quarter | Focus Area | Key Action | Expected Result. Long-term implications for the next 2-3 years."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence comprehensive annual outlook)"
}`,

    education: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED and COMPREHENSIVE Education & Competitive Exam Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 4-6 detailed paragraphs minimum per section
- Use ### sub-headings, **bold** for key terms, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart — reference exact planet placements

Return JSON:
{
  "title": "Education & Competitive Exam Report",
  "sections": [
    {
      "heading": "4th & 5th House Analysis",
      "content": "markdown string — 4th house (formal education) and 5th house (intelligence, higher learning) analysis. Table: House | Sign | Lord | Placement | Educational Impact. Discuss vidya yogas present in the chart."
    },
    {
      "heading": "Mercury & Jupiter Strength Assessment",
      "content": "markdown string — Detailed analysis of Mercury (intellect, communication) and Jupiter (wisdom, higher knowledge). Table: Planet | Sign | House | Dignity | Nakshatra | Educational Strength Rating. How these placements affect learning ability, memory, and analytical skills."
    },
    {
      "heading": "Best Fields of Study",
      "content": "markdown string — Based on planetary strengths and house lords, recommend 6-8 specific academic fields. Use bullet list with reasoning for each. Include both conventional and unconventional options. Rank by chart suitability."
    },
    {
      "heading": "Best Periods for Studies & Exams",
      "content": "markdown string — Table: Dasha Period | Duration | Study Favorability (High/Medium/Low) | Best For | Key Transit Support. Cover next 5-7 years. Highlight the absolute best windows for competitive exam preparation and attempts."
    },
    {
      "heading": "Foreign Education Prospects",
      "content": "markdown string — 9th house (higher education, foreign travel) and 12th house (foreign residence) analysis. Table of foreign education indicators and their strength. Specific countries/directions favorable. Best timing for foreign education pursuit."
    },
    {
      "heading": "Competitive Exam Success Indicators",
      "content": "markdown string — Analyze 6th house (competition), 10th house (achievement), and Mars/Saturn strength. Table: Factor | Planet/House | Strength | Exam Impact. Specific strategies for exam preparation based on chart. Best days of week, timings for study."
    },
    {
      "heading": "Remedies for Academic Excellence",
      "content": "markdown string — Saraswati puja details, Mercury/Jupiter strengthening remedies. Gemstones, mantras with japa count, study room vastu tips, charity recommendations. Use detailed bullet lists."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence comprehensive education outlook)"
}`,

    complete: `${langPrefix}Based on the following accurately calculated Kundli data, generate an EXTREMELY DETAILED and COMPREHENSIVE Complete Life Report covering ALL aspects of life. This is the premium bundle — it should be the most thorough report possible.

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES for each section's "content" field:
- Write 5-8 detailed paragraphs minimum per section — this is the COMPLETE report, be exhaustive
- Use ### sub-headings, **bold** for key terms, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart — reference exact planet placements
- Include classical text references (Brihat Parashara, Phaladeepika, Saravali)
- Every section should have at least one table for structured data

Return JSON:
{
  "title": "Complete Life Report",
  "sections": [
    {
      "heading": "Personality & Character Analysis",
      "content": "markdown string — Lagna analysis, Moon sign personality, Sun sign, dominant planet influence. Table: Key Personality Factor | Planet/Sign | Trait | Strength. Physical appearance tendencies, mental disposition, behavioral patterns. How others perceive vs inner self."
    },
    {
      "heading": "Career & Professional Life",
      "content": "markdown string — 10th house, Dashamsa, career yogas, best professions. Table: Career Field | Suitability Rating | Key Planet. Current dasha career impact. 12-month career forecast table."
    },
    {
      "heading": "Wealth & Financial Prospects",
      "content": "markdown string — 2nd, 11th house analysis, Dhana yogas. Table: Yoga | Planets | Effect | Period Active. Wealth accumulation periods, investment guidance, financial risks. Best periods for property purchase, business expansion."
    },
    {
      "heading": "Marriage & Relationships",
      "content": "markdown string — 7th house, Venus, Jupiter analysis. Spouse characteristics table. Manglik assessment. Marriage timing with dasha analysis. Relationship strengths/challenges. Navamsa chart interpretation."
    },
    {
      "heading": "Health & Wellness",
      "content": "markdown string — 6th, 8th house analysis. Table: Body Area | Ruling Planet | Risk Level | Prevention. Ayurvedic constitution, mental health indicators, health timeline with caution periods."
    },
    {
      "heading": "Education & Knowledge",
      "content": "markdown string — 4th, 5th house, Mercury/Jupiter analysis. Best study fields, competitive exam indicators. Foreign education prospects. Best study periods table."
    },
    {
      "heading": "Family & Children",
      "content": "markdown string — 4th house (mother/home), 9th house (father/fortune), 5th house (children). Table: Family Area | House | Lord | Placement | Outlook. Children timing, family harmony indicators, property from family."
    },
    {
      "heading": "Spiritual Growth & Past Life Karma",
      "content": "markdown string — 12th house (moksha), 9th house (dharma), 5th house (purva punya). Karmic debts indicated by Rahu/Ketu axis. Spiritual practices suited to this chart. Past life indicators and current life purpose."
    },
    {
      "heading": "Annual Forecast 2025-2026",
      "content": "markdown string — Month-by-month table: Month | Career | Finance | Relationships | Health | Rating. Best and worst months highlighted. Key transit impacts throughout the year."
    },
    {
      "heading": "Comprehensive Remedies & Life Recommendations",
      "content": "markdown string — Table: Planet | Affliction | Gemstone | Mantra | Charity | Fasting Day. Yantra recommendations, temple visits, vastu tips. Lifestyle changes for overall chart harmony. Daily routine recommendations."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string", "string", "string"],
  "overallOutlook": "string (4-5 sentence comprehensive life outlook covering career, relationships, health, and spiritual growth)"
}`,

    gemstone: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED Gemstone Recommendation Report. The planetary positions are computed from astronomical ephemeris — use them as-is.

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES:
- Write 4-6 detailed paragraphs per section
- Use ### sub-headings, **bold**, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart

Return JSON:
{
  "title": "Gemstone Recommendation Report",
  "sections": [
    {
      "heading": "Planetary Strength Assessment",
      "content": "markdown string — Table: Planet | Sign | House | Dignity | Strength (Strong/Medium/Weak) | Benefic/Malefic for Lagna. Identify which planets need strengthening and which are already strong."
    },
    {
      "heading": "Primary Gemstone Recommendation",
      "content": "markdown string — The ONE most important gemstone for this chart. Include: gem name, weight in carats, metal (gold/silver), ring finger, wearing day and time, activation mantra with japa count, expected benefits. Explain why this gem is the top priority based on chart analysis."
    },
    {
      "heading": "Secondary Gemstones",
      "content": "markdown string — 2-3 additional beneficial gemstones. Table: Gemstone | Planet | Carat | Metal | Finger | Day | Cost Range (INR). For each, explain the specific benefit for this chart."
    },
    {
      "heading": "Gemstones to AVOID",
      "content": "markdown string — Critically important — list gems that are HARMFUL for this Lagna. Table: Gemstone | Planet | Reason to Avoid | Potential Harm. Explain why strengthening certain planets would be detrimental."
    },
    {
      "heading": "Wearing Instructions & Activation Ritual",
      "content": "markdown string — Step-by-step guide: purification (milk/Ganga water), mantra recitation count, best muhurat for wearing, which day/time/nakshatra. Include specific Vedic mantras for each recommended gem."
    },
    {
      "heading": "Alternative Remedies (Budget-Friendly)",
      "content": "markdown string — For those who cannot afford gemstones: semi-precious substitutes table (e.g., Garnet instead of Ruby), color therapy, root/herb alternatives, deity worship. Table: Original Gem | Substitute | Cost | Effectiveness."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence summary of gemstone strategy)"
}`,

    child: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED Child & Progeny Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES:
- Write 4-6 detailed paragraphs per section
- Use ### sub-headings, **bold**, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart

Return JSON:
{
  "title": "Child & Progeny Report",
  "sections": [
    {
      "heading": "5th House Analysis — Children Prospects",
      "content": "markdown string — Detailed 5th house sign, lord placement, planets in/aspecting 5th house. Table: Factor | Planet/Sign | Indication | Strength. Putra Karaka (Jupiter) analysis. Overall fertility and children prospects."
    },
    {
      "heading": "Number & Gender of Children",
      "content": "markdown string — Classical indicators for number of children from 5th house, its lord, and Jupiter. Beeja Sphuta (male) / Kshetra Sphuta (female) analysis. Table of indicators."
    },
    {
      "heading": "Timing of Childbirth",
      "content": "markdown string — Dasha-based timing analysis. Table: Dasha Period | Duration | Childbirth Probability | Key Transit Support. Highlight the most favorable periods. Jupiter and 5th lord transit analysis."
    },
    {
      "heading": "Child's Nature & Characteristics",
      "content": "markdown string — Based on 5th house sign and planets, describe likely characteristics of children: temperament, talents, health, academic inclination. Include Nakshatra-based baby name suggestions (first syllable recommendations)."
    },
    {
      "heading": "Parent-Child Relationship",
      "content": "markdown string — 5th house from Lagna and Moon analysis. Will the relationship be harmonious? Challenges indicated. Which child (1st, 2nd) brings more fortune? Putra Yoga analysis."
    },
    {
      "heading": "Remedies for Progeny",
      "content": "markdown string — Santan Gopal mantra, Jupiter strengthening remedies, Navagraha puja, specific temple visits, gemstones, fasting. Table: Remedy | Planet | Method | Duration. Include remedies for both conception and child wellbeing."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence progeny outlook)"
}`,

    property: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED Property & Real Estate Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES:
- Write 4-6 detailed paragraphs per section
- Use ### sub-headings, **bold**, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart

Return JSON:
{
  "title": "Property & Real Estate Report",
  "sections": [
    {
      "heading": "4th House Analysis — Property & Vehicles",
      "content": "markdown string — 4th house sign, lord placement, planets in/aspecting 4th house. Table: Factor | Planet/Sign | Property Indication | Strength. Mars (Bhoomi Karaka) analysis. Overall property ownership prospects."
    },
    {
      "heading": "Property Yogas in Chart",
      "content": "markdown string — Identify all property-related yogas: Raja Yoga involving 4th house, Dhana Yoga for real estate wealth, Mars-Venus-Jupiter combinations. Table: Yoga | Planets Involved | Houses | Effect | Strength."
    },
    {
      "heading": "Best Time to Buy Property",
      "content": "markdown string — Dasha-based timing. Table: Period | Duration | Buy/Sell Favorability | Reasoning | Best For (residential/commercial/land). Transit analysis for next 5 years. Highlight absolute best windows."
    },
    {
      "heading": "Favorable Direction & Location",
      "content": "markdown string — Based on 4th lord and benefic planet positions, recommend favorable directions (North/South/East/West). Table: Direction | Ruling Planet | Suitability for This Chart. City vs suburb analysis. Vastu considerations from chart."
    },
    {
      "heading": "Ancestral Property & Inheritance",
      "content": "markdown string — 4th house (mother's property), 9th house (father's property), 8th house (inheritance). Table: Source | House | Lord | Placement | Inheritance Prospects. Legal dispute indicators if any."
    },
    {
      "heading": "Remedies for Property Acquisition",
      "content": "markdown string — Bhoomi puja details, Mars strengthening, specific mantras for property. Table: Remedy | Purpose | Method | Timing. Vastu tips based on chart. Charity recommendations."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence property outlook)"
}`,

    foreign: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED Foreign Travel & Settlement Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT FORMATTING RULES:
- Write 4-6 detailed paragraphs per section
- Use ### sub-headings, **bold**, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart

Return JSON:
{
  "title": "Foreign Travel & Settlement Report",
  "sections": [
    {
      "heading": "9th & 12th House Analysis — Foreign Prospects",
      "content": "markdown string — 9th house (long-distance travel, fortune abroad) and 12th house (foreign residence, settlement). Table: House | Sign | Lord | Placement | Foreign Travel Indication. Rahu's role in foreign connections."
    },
    {
      "heading": "Foreign Settlement Yogas",
      "content": "markdown string — Identify specific yogas: 12th lord in 9th, Rahu in 7th/9th/12th, Moon-Rahu connection, 4th lord in 12th. Table: Yoga | Planets | Houses | Settlement Probability | Type (temporary/permanent)."
    },
    {
      "heading": "Best Countries & Directions",
      "content": "markdown string — Based on strong planets and their directional strength (Dig Bala). Table: Direction | Countries | Ruling Planet | Suitability Rating (1-5) | Best For (study/work/business). Include specific country recommendations."
    },
    {
      "heading": "Timing of Foreign Travel",
      "content": "markdown string — Dasha-based timing. Table: Period | Duration | Travel Probability | Type (short visit/long stay/permanent) | Key Transit. Highlight best windows for visa applications, job offers abroad, study abroad."
    },
    {
      "heading": "Career & Success Abroad",
      "content": "markdown string — 10th house from 12th (career in foreign land), 7th house (foreign business partnerships). Table: Career Field | Suitability Abroad | Key Planet. Wealth accumulation abroad vs homeland comparison."
    },
    {
      "heading": "Remedies for Foreign Travel Success",
      "content": "markdown string — Rahu remedies (primary), 9th/12th lord strengthening. Specific mantras, gemstones, charity. Table: Remedy | Planet | Method | Expected Benefit. Travel safety mantras and auspicious travel timings."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence foreign travel outlook)"
}`,

    sadesati: `${langPrefix}Based on the following accurately calculated Kundli data, generate a VERY DETAILED Sade Sati & Saturn Analysis Report:

${JSON.stringify(kundliData, null, 2)}

IMPORTANT: Saturn's current transit position (February 2026) is in Pisces (Meena Rashi). Use this for Sade Sati calculation.

IMPORTANT FORMATTING RULES:
- Write 4-6 detailed paragraphs per section
- Use ### sub-headings, **bold**, bullet lists, and markdown tables
- Be EXTREMELY specific to THIS chart

Return JSON:
{
  "title": "Sade Sati & Saturn Analysis Report",
  "sections": [
    {
      "heading": "Saturn in Your Birth Chart",
      "content": "markdown string — Saturn's natal position: sign, house, nakshatra, dignity, aspects. Table: Factor | Detail | Impact. Saturn as yogakaraka or malefic for this Lagna. Shani's functional nature for this ascendant. Retrograde Saturn analysis if applicable."
    },
    {
      "heading": "Current Sade Sati Status",
      "content": "markdown string — Is Sade Sati active? Which phase (Rising/Peak/Setting)? Table: Phase | Saturn Transit Sign | Duration | Start Date | End Date | Severity. If not in Sade Sati, when is the next one? Previous Sade Sati periods and what happened."
    },
    {
      "heading": "Sade Sati Effects on Your Chart",
      "content": "markdown string — Based on Moon sign and Saturn's natal position, describe specific effects: career disruptions, health issues, relationship strain, financial challenges, mental stress. Table: Life Area | Effect | Severity (1-5) | Peak Period. Also mention positive Sade Sati outcomes (discipline, spiritual growth)."
    },
    {
      "heading": "Saturn Dasha & Antardasha Analysis",
      "content": "markdown string — When does Saturn Mahadasha occur in your Vimshottari cycle? Table: Dasha Period | Planet | Duration | Saturn's Role | Expected Effects. Current dasha interaction with Saturn transit. Sade Sati during Saturn dasha is the most intense — analyze this."
    },
    {
      "heading": "Dhaiyya (Small Panoti) Analysis",
      "content": "markdown string — Saturn transit over 4th and 8th from Moon. Table: Transit | Duration | From-To | Effects | Severity. Compare Dhaiyya severity with Sade Sati for this chart."
    },
    {
      "heading": "Complete Saturn Remedies",
      "content": "markdown string — Comprehensive remedies: Shani mantra (with exact count), Hanuman Chalisa, Saturday fasting rules, Blue Sapphire assessment (whether safe for this Lagna), iron/black sesame charity, Shani temple visits, Til oil lamp. Table: Remedy | Method | Frequency | Duration | Expected Relief. Include Shani Shanti Puja details."
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string (3-4 sentence Saturn/Sade Sati outlook)"
}`,
  };

  return {
    system: SYSTEM_PROMPT,
    user: reportPrompts[reportType] || reportPrompts.career,
  };
}

export function getMatchingInterpretationPrompt(boyChart, girlChart, boyDetails, girlDetails, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Perform Ashtakoot Gun Milan for the following couple. The birth charts have been accurately calculated using astronomical ephemeris. Use the given Moon signs and nakshatras for the matching — do NOT recalculate them.

BOY:
Name: ${boyDetails.name}
Moon Sign: ${boyChart.moonSign.sign}
Moon Nakshatra: ${boyChart.moonSign.nakshatra} (Pada ${boyChart.moonSign.pada})
Lagna: ${boyChart.lagna.sign}
Manglik: ${boyChart.manglikStatus.isManglik ? 'Yes (' + boyChart.manglikStatus.severity + ')' : 'No'}

GIRL:
Name: ${girlDetails.name}
Moon Sign: ${girlChart.moonSign.sign}
Moon Nakshatra: ${girlChart.moonSign.nakshatra} (Pada ${girlChart.moonSign.pada})
Lagna: ${girlChart.lagna.sign}
Manglik: ${girlChart.manglikStatus.isManglik ? 'Yes (' + girlChart.manglikStatus.severity + ')' : 'No'}

BOY'S FULL CHART:
${boyChart.planets.map(p => `${p.id}: ${p.sign} (House ${p.house})`).join(', ')}

GIRL'S FULL CHART:
${girlChart.planets.map(p => `${p.id}: ${p.sign} (House ${p.house})`).join(', ')}

Perform the 8 Kuta (Ashtakoot) matching based on their Moon signs and nakshatras. Return JSON:
{
  "boy": {
    "name": "${boyDetails.name}",
    "moonSign": "${boyChart.moonSign.sign}",
    "nakshatra": "${boyChart.moonSign.nakshatra}"
  },
  "girl": {
    "name": "${girlDetails.name}",
    "moonSign": "${girlChart.moonSign.sign}",
    "nakshatra": "${girlChart.moonSign.nakshatra}"
  },
  "totalScore": number (out of 36),
  "kutas": [
    { "name": "Varna", "maxPoints": 1, "scored": number, "description": "string" },
    { "name": "Vashya", "maxPoints": 2, "scored": number, "description": "string" },
    { "name": "Tara", "maxPoints": 3, "scored": number, "description": "string" },
    { "name": "Yoni", "maxPoints": 4, "scored": number, "description": "string" },
    { "name": "Graha Maitri", "maxPoints": 5, "scored": number, "description": "string" },
    { "name": "Gana", "maxPoints": 6, "scored": number, "description": "string" },
    { "name": "Bhakut", "maxPoints": 7, "scored": number, "description": "string" },
    { "name": "Nadi", "maxPoints": 8, "scored": number, "description": "string" }
  ],
  "manglikStatus": {
    "boy": { "isManglik": ${boyChart.manglikStatus.isManglik}, "details": "${boyChart.manglikStatus.details}" },
    "girl": { "isManglik": ${girlChart.manglikStatus.isManglik}, "details": "${girlChart.manglikStatus.details}" }
  },
  "compatibility": {
    "mental": "string (paragraph about mental compatibility)",
    "physical": "string (paragraph about physical compatibility)",
    "financial": "string (paragraph about financial compatibility)",
    "family": "string (paragraph about family compatibility)"
  },
  "overallVerdict": "string (clear recommendation with reasoning)",
  "remedies": "string (remedies if needed, or null if not needed)"
}`,
  };
}

// Keep backward compatibility
export function getMatchingPrompt(boyDetails, girlDetails, lang = 'en') {
  return getMatchingInterpretationPrompt({}, {}, boyDetails, girlDetails, lang);
}

export function getBusinessCompatibilityPrompt(chart1, chart2, person1, person2, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Analyze business compatibility between two people. The birth charts have been accurately calculated using astronomical ephemeris. Trust these positions absolutely.

PERSON 1:
Name: ${person1.name}
Moon Sign: ${chart1.moonSign?.sign}, Nakshatra: ${chart1.moonSign?.nakshatra}
Lagna: ${chart1.lagna?.sign}
Planets: ${chart1.planets?.map(p => `${p.id}: ${p.sign} (H${p.house})`).join(', ')}

PERSON 2:
Name: ${person2.name}
Moon Sign: ${chart2.moonSign?.sign}, Nakshatra: ${chart2.moonSign?.nakshatra}
Lagna: ${chart2.lagna?.sign}
Planets: ${chart2.planets?.map(p => `${p.id}: ${p.sign} (H${p.house})`).join(', ')}

Analyze business compatibility focusing on:
- 2nd house (finances), 7th house (partnerships), 10th house (career/status), 11th house (gains)
- Sun-Sun compatibility (leadership styles)
- Mercury-Mercury compatibility (communication)
- Jupiter aspects (growth/expansion potential)
- Saturn compatibility (discipline, longevity of partnership)

Return JSON:
{
  "person1": { "name": "${person1.name}", "moonSign": "${chart1.moonSign?.sign}" },
  "person2": { "name": "${person2.name}", "moonSign": "${chart2.moonSign?.sign}" },
  "overallScore": number (1-10),
  "scoreLabel": "string (Excellent/Good/Average/Challenging)",
  "compatibility": {
    "communication": "string (2-3 sentences: Mercury-Mercury analysis, how they communicate in business)",
    "leadership": "string (2-3 sentences: Sun-Sun analysis, power dynamics)",
    "financial": "string (2-3 sentences: 2nd/11th house, wealth generation together)",
    "trustReliability": "string (2-3 sentences: Saturn compatibility, long-term reliability)",
    "growthPotential": "string (2-3 sentences: Jupiter aspects, expansion potential)"
  },
  "bestBusinessTypes": ["string (e.g., 'Technology', 'Finance', 'Creative Arts')"],
  "strengths": ["string", "string", "string"],
  "challenges": ["string", "string"],
  "overallVerdict": "string (clear recommendation for business partnership)",
  "advice": "string (practical tips for working together)"
}`,
  };
}

export function getFriendshipCompatibilityPrompt(chart1, chart2, person1, person2, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Analyze friendship compatibility between two people. The birth charts have been accurately calculated using astronomical ephemeris. Trust these positions absolutely.

PERSON 1:
Name: ${person1.name}
Moon Sign: ${chart1.moonSign?.sign}, Nakshatra: ${chart1.moonSign?.nakshatra}
Lagna: ${chart1.lagna?.sign}
Planets: ${chart1.planets?.map(p => `${p.id}: ${p.sign} (H${p.house})`).join(', ')}

PERSON 2:
Name: ${person2.name}
Moon Sign: ${chart2.moonSign?.sign}, Nakshatra: ${chart2.moonSign?.nakshatra}
Lagna: ${chart2.lagna?.sign}
Planets: ${chart2.planets?.map(p => `${p.id}: ${p.sign} (H${p.house})`).join(', ')}

Analyze friendship compatibility focusing on:
- Moon-Moon compatibility (emotional connection)
- 5th house (fun, creativity, shared interests)
- 11th house (social circle, shared networks)
- Mercury-Mercury (communication, humor)
- Venus placements (shared interests, social enjoyment)

Return JSON:
{
  "person1": { "name": "${person1.name}", "moonSign": "${chart1.moonSign?.sign}" },
  "person2": { "name": "${person2.name}", "moonSign": "${chart2.moonSign?.sign}" },
  "overallScore": number (1-10),
  "scoreLabel": "string (Best Friends/Great Friends/Good Friends/Acquaintances)",
  "compatibility": {
    "emotionalBond": "string (2-3 sentences: Moon-Moon, emotional understanding)",
    "communication": "string (2-3 sentences: Mercury analysis, humor, conversations)",
    "sharedInterests": "string (2-3 sentences: 5th house, Venus, fun activities)",
    "loyalty": "string (2-3 sentences: Saturn, long-term friendship potential)",
    "socialLife": "string (2-3 sentences: 11th house, how they are in groups)"
  },
  "sharedActivities": ["string (e.g., 'Travel', 'Sports', 'Music')"],
  "strengths": ["string", "string", "string"],
  "challenges": ["string", "string"],
  "overallVerdict": "string (summary of friendship dynamics)",
  "advice": "string (tips for strengthening the friendship)"
}`,
  };
}

export function getMuhuratPrompt(eventType, startDate, endDate, birthDetails, lang = 'en') {
  const birthContext = birthDetails
    ? `\nThe person requesting the muhurat was born on ${birthDetails.dob} at ${birthDetails.tob} in ${birthDetails.pob}. Consider their chart for personalized muhurat selection.`
    : '';

  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Find auspicious Shubh Muhurats for the following event:

Event Type: ${eventType}
Date Range: ${startDate} to ${endDate}${birthContext}

Find 5-8 of the best auspicious dates/times within this range. Return JSON:
{
  "eventType": "${eventType}",
  "muhurats": [
    {
      "date": "string (YYYY-MM-DD)",
      "day": "string (e.g., Monday)",
      "tithi": "string",
      "nakshatra": "string",
      "timeWindow": "string (e.g., 9:15 AM - 11:30 AM)",
      "rating": number (1-5),
      "reason": "string (why this muhurat is good)"
    }
  ],
  "generalAdvice": "string (tips for the event)"
}`,
  };
}

export function getDailyRashifalPrompt(rashi, date, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Generate today's daily Rashifal (horoscope) for ${rashi} for the date ${date}.

Consider current planetary transits and provide personalized predictions. Return JSON:
{
  "rashi": "${rashi}",
  "date": "${date}",
  "overallRating": number (1-5),
  "general": "string (2-3 sentences overall prediction)",
  "career": "string (2-3 sentences)",
  "love": "string (2-3 sentences)",
  "health": "string (2-3 sentences)",
  "finance": "string (2-3 sentences)",
  "luckyNumber": number,
  "luckyColor": "string",
  "luckyTime": "string (e.g., 2:00 PM - 4:00 PM)",
  "tip": "string (motivational or practical tip for the day)"
}`,
  };
}

export function getNumerologyPrompt({ name, dob, numbers }, lang = 'en') {
  const NUMEROLOGY_SYSTEM = `You are an expert numerologist with deep knowledge of Pythagorean numerology, Chaldean numerology, and Vedic Sankhya Shastra. You provide detailed, personalized numerological analysis.

CRITICAL: Always respond in valid JSON format as specified. The outer response must be pure JSON (no markdown code blocks wrapping it). Content string values should use **bold** for key terms and be thorough.`;

  return {
    systemPrompt: NUMEROLOGY_SYSTEM,
    userPrompt: `${getLangInstruction(lang)}Provide a detailed numerological interpretation for:

Name: ${name}
Date of Birth: ${dob}

CALCULATED NUMBERS (Pythagorean system):
- Life Path Number: ${numbers.lifePath}
- Expression Number: ${numbers.expression}
- Soul Urge Number: ${numbers.soulUrge}
- Personality Number: ${numbers.personality}
- Birthday Number: ${numbers.birthday}

Return JSON:
{
  "sections": [
    {
      "heading": "Life Path ${numbers.lifePath} — Your Life Purpose",
      "content": "string (2-3 paragraphs: detailed interpretation of Life Path number, life mission, key challenges, how this number shapes their journey)"
    },
    {
      "heading": "Expression ${numbers.expression} — Your Natural Talents",
      "content": "string (1-2 paragraphs: talents, abilities, how they express themselves to the world)"
    },
    {
      "heading": "Soul Urge ${numbers.soulUrge} — Your Inner Desires",
      "content": "string (1-2 paragraphs: deepest motivations, what truly fulfills them)"
    },
    {
      "heading": "Personality ${numbers.personality} — How Others See You",
      "content": "string (1-2 paragraphs: outward persona, first impressions, social style)"
    },
    {
      "heading": "Birthday ${numbers.birthday} — Your Special Gift",
      "content": "string (1 paragraph: unique talent or ability from birthday number)"
    },
    {
      "heading": "Number Compatibility & Relationships",
      "content": "string (1-2 paragraphs: which numbers are most compatible, relationship strengths and challenges)"
    },
    {
      "heading": "Career & Life Guidance",
      "content": "string (1-2 paragraphs: best career paths, key advice based on the number combination)"
    }
  ],
  "luckyInfo": {
    "numbers": "string (comma-separated lucky numbers)",
    "colors": "string (comma-separated lucky colors)",
    "days": "string (comma-separated lucky days of the week)"
  },
  "overallSummary": "string (2-3 sentences summarizing the overall numerological profile)"
}`,
  };
}

export function getWeeklyRashifalPrompt(rashi, startDate, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Generate a weekly Rashifal (horoscope) for ${rashi} for the week starting ${startDate}.

Consider current planetary transits and provide day-by-day insights. Return JSON:
{
  "rashi": "${rashi}",
  "startDate": "${startDate}",
  "overallRating": number (1-5),
  "weekSummary": "string (3-4 sentences overall weekly prediction)",
  "days": [
    { "day": "Monday", "highlight": "string (1-2 sentences key prediction for this day)" },
    { "day": "Tuesday", "highlight": "string" },
    { "day": "Wednesday", "highlight": "string" },
    { "day": "Thursday", "highlight": "string" },
    { "day": "Friday", "highlight": "string" },
    { "day": "Saturday", "highlight": "string" },
    { "day": "Sunday", "highlight": "string" }
  ],
  "career": "string (3-4 sentences weekly career outlook)",
  "love": "string (3-4 sentences weekly love outlook)",
  "health": "string (2-3 sentences weekly health outlook)",
  "finance": "string (2-3 sentences weekly finance outlook)",
  "bestDay": "string (e.g., Wednesday)",
  "challengingDay": "string (e.g., Friday)",
  "luckyNumber": number,
  "luckyColor": "string",
  "tip": "string (practical weekly advice)"
}`,
  };
}

export function getMonthlyRashifalPrompt(rashi, month, year, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Generate a monthly Rashifal (horoscope) for ${rashi} for ${month} ${year}.

Consider major planetary transits for the month and provide week-by-week insights. Return JSON:
{
  "rashi": "${rashi}",
  "month": "${month}",
  "year": ${year},
  "overallRating": number (1-5),
  "monthSummary": "string (4-5 sentences overall monthly prediction)",
  "weeks": [
    { "week": "Week 1 (1st-7th)", "prediction": "string (2-3 sentences)" },
    { "week": "Week 2 (8th-14th)", "prediction": "string (2-3 sentences)" },
    { "week": "Week 3 (15th-21st)", "prediction": "string (2-3 sentences)" },
    { "week": "Week 4 (22nd-${month === 'February' ? '28th' : '30th/31st'})", "prediction": "string (2-3 sentences)" }
  ],
  "career": "string (4-5 sentences monthly career outlook)",
  "love": "string (4-5 sentences monthly love outlook)",
  "health": "string (3-4 sentences monthly health outlook)",
  "finance": "string (3-4 sentences monthly finance outlook)",
  "bestDates": "string (e.g., 5th, 12th, 20th)",
  "challengingDates": "string (e.g., 8th, 15th)",
  "luckyNumber": number,
  "luckyColor": "string",
  "tip": "string (strategic monthly advice)"
}`,
  };
}

export function getYearlyRashifalPrompt(rashi, year, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Generate a yearly Rashifal (horoscope) for ${rashi} for the year ${year}.

Consider major planetary transits (Jupiter, Saturn, Rahu-Ketu) and their effects throughout the year. Return JSON:
{
  "rashi": "${rashi}",
  "year": ${year},
  "overallRating": number (1-5),
  "yearSummary": "string (5-6 sentences overall yearly prediction)",
  "quarters": [
    { "quarter": "Q1 (Jan-Mar)", "prediction": "string (3-4 sentences)" },
    { "quarter": "Q2 (Apr-Jun)", "prediction": "string (3-4 sentences)" },
    { "quarter": "Q3 (Jul-Sep)", "prediction": "string (3-4 sentences)" },
    { "quarter": "Q4 (Oct-Dec)", "prediction": "string (3-4 sentences)" }
  ],
  "career": "string (5-6 sentences yearly career outlook with key months)",
  "love": "string (5-6 sentences yearly love outlook with key months)",
  "health": "string (4-5 sentences yearly health outlook)",
  "finance": "string (4-5 sentences yearly finance outlook)",
  "bestMonths": "string (e.g., March, July, October)",
  "challengingMonths": "string (e.g., May, August)",
  "majorTransits": "string (2-3 sentences about key planet movements affecting this rashi)",
  "luckyNumber": number,
  "luckyColor": "string",
  "tip": "string (key yearly strategy advice)"
}`,
  };
}

export function getFreeRemediesPrompt(kundliData, lang = 'en') {
  const FREE_REMEDIES_SYSTEM = `You are an expert Vedic astrologer specializing in astrological remedies. Planetary positions have been calculated using astronomical ephemeris (Lahiri ayanamsa). DO NOT recalculate positions — only INTERPRET the given data. Respond in valid JSON.`;

  return {
    system: FREE_REMEDIES_SYSTEM,
    user: `${getLangInstruction(lang)}Based on this birth chart, identify weak and afflicted planets and provide basic remedies.

Chart Data:
${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "weakPlanets": [
    {
      "planet": "string (planet name)",
      "issue": "string (1 sentence — why this planet is weak/afflicted)",
      "basicRemedy": "string (1-2 sentences — simple remedy)"
    }
  ],
  "generalAdvice": "string (2-3 sentences of overall spiritual advice based on chart)"
}

Identify 3-5 weak/afflicted planets from this chart.`,
  };
}

export function getDetailedRemediesPrompt(kundliData, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Based on the following accurately calculated Kundli data, provide a comprehensive, personalized remedies report.

${JSON.stringify(kundliData, null, 2)}

Analyze each weak or afflicted planet and provide detailed remedies. Return JSON:
{
  "planetaryRemedies": [
    {
      "planet": "string",
      "status": "string (e.g., Debilitated, Combust, 6th/8th lord, Afflicted by Saturn)",
      "gemstone": {
        "name": "string",
        "weight": "string (e.g., 3-5 carats)",
        "metal": "string (e.g., Gold, Silver)",
        "finger": "string (e.g., Ring finger of right hand)",
        "day": "string (best day to wear)",
        "mantra": "string (mantra to recite while wearing)"
      },
      "mantra": {
        "text": "string (Sanskrit mantra)",
        "count": "string (e.g., 108 times daily)",
        "bestTime": "string (e.g., During sunrise)"
      },
      "charity": "string (what to donate and when)",
      "fasting": "string (which day and what to avoid)",
      "otherRemedies": "string (additional specific remedies — temple visits, yantra, color therapy)"
    }
  ],
  "generalRemedies": {
    "dailyRoutine": "string (recommended daily spiritual routine)",
    "meditation": "string (meditation practice suited to this chart)",
    "vastu": "string (vastu tips based on chart)",
    "lifestyle": "string (lifestyle changes for planetary harmony)"
  },
  "priorityOrder": "string (which remedies to start first and why)",
  "overallGuidance": "string (3-4 sentences of holistic spiritual guidance)"
}

Include 4-6 planetary remedies based on the most afflicted planets.`,
  };
}

export function getTransitInterpretationPrompt(birthChart, transitData, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Analyze the current planetary transits against this person's natal birth chart. The transit positions are calculated using real ephemeris data (astronomy-engine + Lahiri ayanamsa) — trust these numbers absolutely.

Birth Chart Summary:
- Lagna: ${birthChart.lagna?.sign} (${birthChart.lagna?.nakshatra})
- Moon Sign: ${birthChart.moonSign?.sign} (${birthChart.moonSign?.nakshatra})
- Current Dasha: ${birthChart.currentDasha?.mahadasha?.planet} Mahadasha, ${birthChart.currentDasha?.antardasha?.planet} Antardasha

Natal Planets:
${JSON.stringify(birthChart.planets, null, 2)}

Current Transit Data:
${JSON.stringify(transitData, null, 2)}

Analyze how these transits affect the native's life. Consider:
1. Slow planet transits (Saturn, Jupiter, Rahu/Ketu) over key houses
2. Sade Sati status (if applicable)
3. Interaction between transit planets and natal planets (conjunctions, aspects)
4. Current dasha-transit interplay

Return JSON:
{
  "overallEffect": "string (2-3 sentences: overall transit climate for this person right now)",
  "transitEffects": [
    {
      "planet": "string (planet name)",
      "sign": "string",
      "houseFromMoon": number,
      "effect": "string (2-3 sentences specific to this person's chart)",
      "impact": "benefic|neutral|challenging"
    }
  ],
  "sadeSati": {
    "active": boolean,
    "phase": "string or null",
    "effect": "string (1-2 sentences, or null if not active)"
  },
  "careerFinance": "string (2-3 sentences on career/finance outlook from transits)",
  "relationships": "string (2-3 sentences on relationship outlook)",
  "healthWellness": "string (2-3 sentences on health outlook)",
  "advice": "string (3-4 sentences: practical advice for this transit period)",
  "bestPeriods": "string (upcoming favorable windows)",
  "challengingPeriods": "string (periods to be cautious)"
}

Include 5-7 transit effects for the most impactful transiting planets.`,
  };
}

// ── Instagram Caption Prompts ──

const IG_CAPTION_SYSTEM = `You are a social media expert for MyRashifal+, a Vedic astrology app. Write engaging Instagram captions in Hinglish (Hindi-English mix) that drive engagement. Keep captions under 2000 characters. Always end with CTA and 15-20 hashtags.`;

export function getInstagramRashifalCaptionPrompt(rashiNameEn, rashiNameHi, date) {
  return {
    system: IG_CAPTION_SYSTEM,
    user: `Write an Instagram caption for today's (${date}) rashifal post for ${rashiNameEn} (${rashiNameHi}).

Requirements:
- Start with attention-grabbing line about ${rashiNameEn} today
- Include 2-3 sentences of prediction (career, love, health)
- Add a lucky number and lucky color
- Include a motivational tip
- End with CTA: "Apna full rashifal dekhein 👉 myrashifal.in (link in bio)"
- Add 15-20 hashtags mixing English and Hindi astrology terms

Return ONLY the caption text, no JSON.`,
  };
}

export function getInstagramTipCaptionPrompt(tipTopic, date) {
  return {
    system: IG_CAPTION_SYSTEM,
    user: `Write an Instagram caption for an educational astrology post about: "${tipTopic}" (date: ${date}).

Requirements:
- Start with a hook question or surprising fact
- Explain the topic in 3-5 short paragraphs (Hinglish, conversational)
- Include "Save this for later!" or "Tag someone who needs this!"
- End with CTA: "Apni kundli mein check karein 👉 myrashifal.in (link in bio)"
- Add 15-20 hashtags

Return ONLY the caption text, no JSON.`,
  };
}

export function getInstagramAdCaptionPrompt(featureName, featurePrice) {
  return {
    system: IG_CAPTION_SYSTEM,
    user: `Write a promotional Instagram caption for MyRashifal+ feature: ${featureName} (Price: ${featurePrice}).

Requirements:
- Open with a pain point or aspiration
- Explain what the feature offers in 3-4 bullet points
- Mention the price prominently (or "FREE" if applicable)
- Add urgency or social proof
- End with CTA: "Abhi try karein 👉 myrashifal.in (link in bio)"
- Add 15-20 conversion-focused hashtags

Return ONLY the caption text, no JSON.`,
  };
}

export function getAskQuestionPrompt(question, kundliData, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}A person has asked the following life question. Answer it based on their Vedic birth chart data (positions accurately calculated via astronomical ephemeris):

Question: "${question}"

Their Kundli Data:
${JSON.stringify(kundliData, null, 2)}

Analyze their chart — look at relevant houses, dasha periods, transits, and yogas — to provide a thorough, personalized answer. Return JSON:
{
  "question": "${question}",
  "chartContext": "string (mention key chart factors: e.g., 'Based on your Moon in Cancer, Saturn transiting your 7th house, and Jupiter Mahadasha...')",
  "answer": "string (3-4 detailed paragraphs answering the question with chart-specific reasoning)",
  "relevantFactors": ["string (e.g., '10th lord in 9th house')", "string", "string"],
  "advice": "string (practical advice based on the analysis)",
  "remedy": "string (if applicable, a specific remedy)"
}`,
  };
}

export function getPromoEmailPrompt(reportType, reportName, lang = 'en') {
  return {
    system: SYSTEM_PROMPT,
    user: `${getLangInstruction(lang)}Generate a short, engaging astrology tip for a promotional email about "${reportName}" report.

Return JSON:
{
  "tip": "string (2-3 sentences of insightful astrology wisdom related to ${reportType} - career, marriage, health, etc.)",
  "cta": "string (1 short compelling sentence encouraging the reader to get their ${reportType} report)"
}

The tip should feel like genuine astrological wisdom, not a sales pitch. Make it interesting and useful. The CTA should be subtle but persuasive.`,
  };
}
