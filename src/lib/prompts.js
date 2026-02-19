const LANG_INSTRUCTIONS = {
  hi: 'IMPORTANT: Respond entirely in Hindi (Devanagari script). Use Hindi for all section headings, descriptions, and advice. Astrological terms (Rashi, Nakshatra, Dasha, Yoga, Graha names) should remain in their Sanskrit/Hindi form.\n\n',
  mr: 'IMPORTANT: Respond entirely in Marathi (Devanagari script). Use Marathi for all section headings, descriptions, and advice. Astrological terms (Rashi, Nakshatra, Dasha, Yoga, Graha names) should remain in their Sanskrit/Hindi form.\n\n',
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
