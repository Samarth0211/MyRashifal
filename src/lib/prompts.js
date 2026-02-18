const SYSTEM_PROMPT = `You are an expert Vedic astrologer with deep knowledge of Brihat Parashara Hora Shastra, Jataka Parijata, Phaladeepika, and Saravali. You provide detailed, personalized astrological analysis based on birth chart data.

IMPORTANT: Planetary positions, houses, nakshatras, and dashas have already been accurately calculated using astronomical ephemeris (Lahiri ayanamsa, Equal house system). DO NOT recalculate or contradict these positions. Your role is to INTERPRET the given data using classical Vedic astrology principles.

Your interpretations must be:
- Specific and personalized (never generic)
- Grounded in classical texts with occasional references
- Detailed with clear reasoning
- Balanced (mention both positive and challenging aspects)
- Culturally appropriate for an Indian audience

CRITICAL: Always respond in valid JSON format as specified in each prompt. No markdown, no code blocks — pure JSON only.`;

export function getKundliInterpretationPrompt(birthDetails, calculatedData) {
  return {
    system: SYSTEM_PROMPT,
    user: `The following Vedic birth chart has been accurately calculated using astronomical ephemeris (astronomy-engine library with Lahiri ayanamsa). Please INTERPRET this chart — do NOT recalculate any positions.

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
export function getKundliPrompt(birthDetails) {
  return getKundliInterpretationPrompt(birthDetails, {});
}

export function getReportPrompt(kundliData, reportType) {
  const reportPrompts = {
    career: `Based on the following accurately calculated Kundli data, generate a comprehensive Career & Wealth Report. The planetary positions below are computed from astronomical ephemeris — use them as-is for your interpretation.

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Career & Wealth Report",
  "sections": [
    {
      "heading": "10th House Analysis & Career Indications",
      "content": "string (detailed analysis)"
    },
    {
      "heading": "Dashamsa (D-10) Chart Interpretation",
      "content": "string"
    },
    {
      "heading": "Dhana Yoga & Wealth Combinations",
      "content": "string"
    },
    {
      "heading": "Current Dasha Impact on Career",
      "content": "string"
    },
    {
      "heading": "Best Career Fields For You",
      "content": "string (list specific industries and roles)"
    },
    {
      "heading": "Next 12 Months Career Forecast",
      "content": "string (month-by-month highlights)"
    },
    {
      "heading": "Remedies for Career Obstacles",
      "content": "string (specific remedies based on chart)"
    }
  ],
  "highlights": ["string", "string", "string"],
  "overallOutlook": "string"
}`,

    marriage: `Based on the following accurately calculated Kundli data, generate a comprehensive Marriage & Relationship Report:

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Marriage & Relationship Report",
  "sections": [
    {
      "heading": "7th House Analysis & Spouse Characteristics",
      "content": "string"
    },
    {
      "heading": "Manglik Dosha Assessment",
      "content": "string (severity, remedies if applicable)"
    },
    {
      "heading": "Venus & Jupiter Placement Analysis",
      "content": "string"
    },
    {
      "heading": "Upapada Lagna Analysis",
      "content": "string"
    },
    {
      "heading": "Marriage Timing Prediction",
      "content": "string (dasha-based timing)"
    },
    {
      "heading": "Relationship Strengths & Challenges",
      "content": "string"
    },
    {
      "heading": "Remedies for Relationship Harmony",
      "content": "string"
    }
  ],
  "highlights": ["string", "string", "string"],
  "overallOutlook": "string"
}`,

    health: `Based on the following accurately calculated Kundli data, generate a comprehensive Health & Wellness Report:

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Health & Wellness Report",
  "sections": [
    {
      "heading": "6th & 8th House Analysis",
      "content": "string"
    },
    {
      "heading": "Vulnerable Body Areas",
      "content": "string (based on planetary afflictions)"
    },
    {
      "heading": "Mental Health Indicators",
      "content": "string"
    },
    {
      "heading": "Best Health Practices",
      "content": "string (personalized recommendations)"
    },
    {
      "heading": "Periods Requiring Extra Caution",
      "content": "string (dasha-based health alerts)"
    },
    {
      "heading": "Ayurvedic Constitution (Prakriti)",
      "content": "string (based on chart analysis)"
    }
  ],
  "highlights": ["string", "string", "string"],
  "overallOutlook": "string"
}`,

    varshphal: `Based on the following accurately calculated Kundli data, generate a comprehensive Annual Varshphal Report for the current year:

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Annual Varshphal Report",
  "sections": [
    {
      "heading": "Varsha Kundli Analysis",
      "content": "string"
    },
    {
      "heading": "Muntha Position & Effects",
      "content": "string"
    },
    {
      "heading": "Month-by-Month Forecast",
      "content": "string (cover all 12 months with career, finance, relationships highlights)"
    },
    {
      "heading": "Best Months for Career & Finance",
      "content": "string"
    },
    {
      "heading": "Best Months for Relationships",
      "content": "string"
    },
    {
      "heading": "Challenging Periods & Remedies",
      "content": "string"
    },
    {
      "heading": "Year-End Summary & Key Takeaway",
      "content": "string"
    }
  ],
  "highlights": ["string", "string", "string"],
  "overallOutlook": "string"
}`,

    education: `Based on the following accurately calculated Kundli data, generate a comprehensive Education & Competitive Exam Report:

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Education & Competitive Exam Report",
  "sections": [
    {
      "heading": "4th & 5th House Analysis",
      "content": "string"
    },
    {
      "heading": "Mercury & Jupiter Strength Assessment",
      "content": "string"
    },
    {
      "heading": "Best Periods for Studies & Exams",
      "content": "string"
    },
    {
      "heading": "Foreign Education Prospects",
      "content": "string (9th & 12th house analysis)"
    },
    {
      "heading": "Competitive Exam Success Indicators",
      "content": "string"
    }
  ],
  "highlights": ["string", "string", "string"],
  "overallOutlook": "string"
}`,

    complete: `Based on the following accurately calculated Kundli data, generate a Complete Life Report covering all aspects of life:

${JSON.stringify(kundliData, null, 2)}

Return JSON:
{
  "title": "Complete Life Report",
  "sections": [
    {
      "heading": "Personality & Character Analysis",
      "content": "string (detailed)"
    },
    {
      "heading": "Career & Professional Life",
      "content": "string"
    },
    {
      "heading": "Wealth & Financial Prospects",
      "content": "string"
    },
    {
      "heading": "Marriage & Relationships",
      "content": "string"
    },
    {
      "heading": "Health & Wellness",
      "content": "string"
    },
    {
      "heading": "Education & Knowledge",
      "content": "string"
    },
    {
      "heading": "Family & Children",
      "content": "string"
    },
    {
      "heading": "Spiritual Growth & Past Life Karma",
      "content": "string"
    },
    {
      "heading": "Annual Forecast",
      "content": "string"
    },
    {
      "heading": "Key Remedies & Recommendations",
      "content": "string"
    }
  ],
  "highlights": ["string", "string", "string", "string", "string"],
  "overallOutlook": "string"
}`,
  };

  return {
    system: SYSTEM_PROMPT,
    user: reportPrompts[reportType] || reportPrompts.career,
  };
}

export function getMatchingInterpretationPrompt(boyChart, girlChart, boyDetails, girlDetails) {
  return {
    system: SYSTEM_PROMPT,
    user: `Perform Ashtakoot Gun Milan for the following couple. The birth charts have been accurately calculated using astronomical ephemeris. Use the given Moon signs and nakshatras for the matching — do NOT recalculate them.

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
export function getMatchingPrompt(boyDetails, girlDetails) {
  return getMatchingInterpretationPrompt({}, {}, boyDetails, girlDetails);
}

export function getMuhuratPrompt(eventType, startDate, endDate, birthDetails) {
  const birthContext = birthDetails
    ? `\nThe person requesting the muhurat was born on ${birthDetails.dob} at ${birthDetails.tob} in ${birthDetails.pob}. Consider their chart for personalized muhurat selection.`
    : '';

  return {
    system: SYSTEM_PROMPT,
    user: `Find auspicious Shubh Muhurats for the following event:

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

export function getDailyRashifalPrompt(rashi, date) {
  return {
    system: SYSTEM_PROMPT,
    user: `Generate today's daily Rashifal (horoscope) for ${rashi} for the date ${date}.

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

export function getAskQuestionPrompt(question, kundliData) {
  return {
    system: SYSTEM_PROMPT,
    user: `A person has asked the following life question. Answer it based on their Vedic birth chart data (positions accurately calculated via astronomical ephemeris):

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
