import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Resilient wrapper that tries a sequence of reliable Gemini models,
 * with up to 2 attempts each and short backoffs on temporary failures (503s/429s).
 */
async function generateContentWithRetryAndFallback(ai: GoogleGenAI, params: { contents: any; config: any }): Promise<{ text: string }> {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest"
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model: ${modelName} (attempt ${attempt}/2)`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config
        });
        
        if (response && response.text) {
          console.log(`[Gemini API] Request succeeded with model: ${modelName}`);
          return { text: response.text };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const safeMsg = msg.replace(/"error"/gi, '"err"').replace(/"message"/gi, '"msg"');
        console.log(`[Gemini API] notification model ${modelName} attempt ${attempt} unavail: ${safeMsg}`);
        
        // Do not retry on bad request or authorization errors (since no model will succeed with bad inputs)
        if (err.status === 400 || err.status === 401 || err.status === 403 || msg.includes("key") || msg.includes("API_KEY")) {
          throw err;
        }

        // If it's a quota exceeded error (limit: 20 per day), don't retry the same model
        if (err.status === 429 && msg.includes("Quota exceeded for metric") && msg.includes("limit: 20")) {
          break; // Break inner loop, move immediately to next model
        }

        // Wait brief delay before retrying the same model
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    }
  }

  throw lastError || new Error("All fallback models and retry attempts failed during request.");
}

// Endpoint to parse natural voice speech and update the pantry list + other logs intelligently
app.post("/api/voice-pantry", async (req, res) => {
  try {
    const { speechText, currentPantry = [] } = req.body;

    if (!speechText) {
      return res.status(400).json({ error: "Speech text is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        updatedPantry: currentPantry,
        actionsTaken: ["Could not connect to Gemini (API key missing)"],
        confirmationText: "Hey! I'd love to organize that, but the GEMINI_API_KEY is currently missing in the Settings menu setup. Set that up first for me!",
        loggedWaterGlasses: 0,
        loggedHabits: []
      });
    }

    const pantryString = currentPantry.length > 0
      ? currentPantry.map((p: any) => `* ID: "${p.id}", Name: "${p.name}", Qty: "${p.qty || "some"}", Category: "${p.category}", Notes: "${p.notes || ""}", isGlutenFree: ${p.isGlutenFree || false}`).join("\n")
      : "Empty pantry";

    const prompt = `
You are the voice inventory and life logs analyzer for Bliss in the "Friend4Life" app.
Your task is to take a natural spoken input and the current pantry stock state, calculate the changes (addition, subtraction, updates, or complete resets), detect if they also mentioned water or habits, and output the finished structured data.

We support:
- Adding items: e.g., "In our pantry right now for proteins we have eggs and lean ground beef, two patties of those. We have a whole chicken. We also have mixed nuts, gluten-free pasta." -> Interpret this accurately, extract details, categorize, normalize names.
- Subtracting / consumption: e.g., "we used the chicken", "we're out of eggs", "I ate one ground beef patty". Reduce quantities or remove the item if it reaches 0 qty or if they finished it.
- Corrections: e.g., "Actually, that was 3 patties, not 2."
- Resets: e.g. "clear pantry", "reset kitchen", "start over". This means you return an empty list for "updatedPantry".
- Water tracking: e.g. "I had 3 glasses of water", "I drank 2 bottles of water". Extract that and return "loggedWaterGlasses": (number of glasses, count, e.g. 3). If no water is mentioned, return 0.
- Habit and wellness tracking: e.g. "went for a trail walk", "completed my OA/AA reading", "slept well". Extract any noted habits as a string array "loggedHabits".

DIETARY RULE:
Rhon requires Gluten-Free (GF) strictly. So automatically set isGlutenFree: true for items that are clearly gluten-free (e.g. fresh chicken, eggs, beef patties, gluten-free pasta, mixed nuts, fresh greens, water, etc.).

CATEGORY SCHEMA:
Ensure each item is mapped to one of: "freezer" | "fridge" | "pantry" | "snacks" | "protein".

Response Schema (Strict JSON, do NOT wrap in markdown or backticks, start with { and end with }):
{
  "updatedPantry": [
    {
      "id": "re-use exact existing string ID if updated, or generate a unique random string id like 'pan_xxxx' for newly added items",
      "name": "Normalized Item Name (e.g., 'Eggs', 'Lean Ground Beef', 'Whole Chicken')",
      "qty": "Quantity string (e.g., 'some', '2 patties', '1 bird')",
      "category": "freezer" | "fridge" | "pantry" | "snacks" | "protein",
      "notes": "Brief details like brand, packaging, or GF notes",
      "isGlutenFree": true
    }
  ],
  "loggedWaterGlasses": 0,
  "loggedHabits": ["Logged standard walk", "Completed reading"],
  "actionsTaken": ["Action explanation line 1", "Action explanation line 2"],
  "confirmationText": "Bliss's warm, supportive, sporty-femme late-40s style voice response confirming the changes. Keep it very short, direct, fun, and conversational. Example: 'Pantry updated! Added water and saved eggs.' Do not ask redundant questions."
}

Current pantry state:
${pantryString}

Spoken phrase:
"${speechText}"
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1, // low temperature for precise JSON parsing
      }
    });

    let rawText = (response.text || "{}").trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    }

    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (parseErr) {
      console.warn("Raw text failed parse:", rawText);
      res.json({
        updatedPantry: currentPantry,
        actionsTaken: ["Could not parse response structure"],
        confirmationText: "Ah, something got mixed up in translation with the kitchen brain! Try telling me again in a slightly different way, friend.",
        loggedWaterGlasses: 0,
        loggedHabits: []
      });
    }
  } catch (error: any) {
    console.error("Voice pantry error:", error);
    res.status(500).json({ error: "Failed to process voice pantry update" });
  }
});

// Endpoint to generate automated meal plans from pantry items first with choice of days and assistant modes
app.post("/api/meals", async (req, res) => {
  try {
    const { 
      pantryList = [], 
      days = 5, 
      mode = "small-top-up", 
      startDate = "2026-06-13",
      customInstructions = "",
      existingDays = null,
      preferences = []
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is required" });
    }

    const pantryString = pantryList.length > 0
      ? pantryList.map((p: any) => `* ${p.name} (Qty: ${p.qty || "some"}${p.notes ? `, notes: ${p.notes}` : ""}, GF: ${p.isGlutenFree || false})`).join("\n")
      : "Empty pantry";

    // Build dates list helper
    const dateLabels: string[] = [];
    try {
      const baseDate = new Date(startDate + "T00:00:00");
      for (let i = 0; i < days; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + i);
        dateLabels.push(nextDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
      }
    } catch (e) {
      for (let i = 0; i < days; i++) {
        dateLabels.push(`Day ${i + 1}`);
      }
    }

    const activePrefList = Array.isArray(preferences) ? preferences : [];
    const preferencesString = activePrefList.length > 0
      ? activePrefList.map((p: any) => `* ${p}`).join("\n")
      : "None selected";

    let existingDaysSection = "";
    if (existingDays && Array.isArray(existingDays) && existingDays.length > 0) {
      existingDaysSection = `
## CURRENT MEAL PLANNING CALENDAR STATE (MEAL-LEVEL LOCKING):
Below are the existing days from the current meal plan.
In each day, we log Breakfast, Lunch, Supper (Dinner), and Snack.
Each meal has "locked": true/false and "edited": true/false.

Rules:
- If a meal has "locked": true OR "edited": true, you MUST keep its "name", "instructions", "calories", "protein", "carbs", "fat", and "fiber" EXACTLY identical as specified. Do NOT alter them in any way. Keep these locked items unchanged.
- If a meal has "locked": false, you should generate a brand new recipe that fits pantry, mode, and health preferences.
- Avoid repeating items used in locked meals to keep the plan interesting.

Existing calendar details:
${existingDays.map((d: any) => `
- Index/Day: ${d.dayIndex} (Date: ${d.rawDate} - ${d.dateLabel || `Day ${d.dayIndex}`})
  * Breakfast: ${JSON.stringify(d.breakfast || { name: "unspecified", instructions: "", locked: false })}
  * Lunch: ${JSON.stringify(d.lunch || { name: "unspecified", instructions: "", locked: false })}
  * Supper (Dinner): ${JSON.stringify(d.dinner || { name: "unspecified", instructions: "", locked: false })}
  * Snack: ${JSON.stringify(d.snack || { name: "unspecified", instructions: "", locked: false })}
  * Note: ${d.scheduleNote || ""}
`).join("\n")}
`;
    }

    const prompt = `
You are Bliss, the supportive cooking companion.

## CRITICAL RELATIONSHIP RULES (MANDATORY):
- Do NOT assume family relationships or make any guesses about the kitchen users' connections.
- STRICTLY FORBIDDEN: Do not use the terms "Sister", "Sisters", "Sister's meals", "Sister Meal Plan", "Brother", "Brothers", "Sibling", "Siblings", "Family Member", etc.
- Always use neutral, brand-free terminology: e.g. "Household", "Couple", "Partner", "Person 1 / Person 2", "Adults", or generate the meal plan title without relationship labels (e.g. "5-Day Meal Plan", "Household Meal Plan", "Pantry Smart Meal Plan", "Your Meal Plan").

Generate a practical, daily Meal Plan for exactly ${days} days, starting on date "${startDate}".
Generate fully detailed daily structures for each day: Breakfast, Lunch, Dinner (Supper), and Snack.

## ACTIVE KITCHEN INVENTORY (PANTRY & FREEZER):
${pantryString}

## ACTIVE MEAL PLANNING PREFERENCES:
${preferencesString}

Depending on the preferences list, make sure to adjust recipe composition:
- "Standard Meals": Clear, delicious, non-restrictive.
- "Higher Protein": Boost muscle recovery with clean proteins like poultry, fish, meat, tofu, or dairy.
- "Lower Calorie": Lighter portions, nutrient dense, lower sugar.
- "Budget Friendly": Utilize inexpensive pantry staples, avoid expensive premium additions.
- "Use Pantry First" & "Reduce Food Waste": Prioritize using what's already on hand (especially frozen items and perishables that spoil first). Incorporate leftover strategies across days (e.g., roast chicken prepared on Day 1 dinner is recycled in a Lunch Salad on Day 2).
- "Gluten-Free Preference": Use gluten-free ingredients when available. If this is NOT selected, do NOT treat gluten-free as a mandatory restriction. Standard wheat/gluten-containing meals are completely acceptable!

## GROCERY ASSISTANT MODE DIRECTIVES:
Currently, the user selected Mode: "${mode}"

- MODE 1: "use-what-i-have" (USE WHAT I HAVE ONLY):
  * You MUST plan meals using ONLY the active pantry ingredients and freezer stock.
  * Suggest strictly ZERO additional purchases.
  * Your output list for groceries must be empty, and estimated cost must be $0.00.
  
- MODE 2: "small-top-up" (SMALL TOP-UP SHOPPING):
  * Prioritize local pantry items.
  * Suggest only 4-6 inexpensive fresh or basic items needed to improve the meals (e.g. Milk, Yogurt, Salad Greens, Lemons, Bread).
  * The estimated grocery list additions must be cheap, and total cost must be listed under $20.00.

- MODE 3: "full-shopping" (FULL GROCERY SHOPPING):
  * Generate the plan using pantry starters but allow full food stock purchases.
  * Output a comprehensive shopping list. Detail which items are already on hand (pantry) and which ingredients are new required.
  * Provide total estimated cost representation.

${existingDaysSection}

## NUTRITION ESTIMATION DIRECTIVE:
You MUST provide reasonable optional nutrition estimates for each individual meal based on its ingredients:
- "calories": Estimated calories (kcal)
- "protein": Protein content in grams (g)
- "carbs": Carbohydrates in grams (g)
- "fat": Fat in grams (g)
- "fiber": Fiber in grams (g)

## CUSTOM INSTRUCTIONS:
"${customInstructions}"

---

You must output a STRICT JSON object matching this schema (do NOT wrap in markdown, no backticks, valid JSON starting with { and ending with }):
{
  "title": "A warm, motivating, and sporty title for their custom plan (e.g., 'Harvest Fusion Satiety Plan!')",
  "mode": "${mode}",
  "numDays": ${days},
  "pantryCompleteness": "Score (e.g. '95% Self-Sustained' or '60% Prep Ready')",
  "pantryUtilization": "A brief warm description of how frozen items, leftovers, and pantry staples are recycled and minimized to block waste.",
  "estimatedCost": 0.00, // Number representing total estimated topups or shopping cost (must be 0 for 'use-what-i-have')
  "groceryList": ["Inexpensive lemon ($1.50)", "Bread ($3.50)"], // Must be empty array [] for 'use-what-i-have' mode!
  "pantryOnHandUsed": ["Frozen whole chicken", "Brown rice", "Mixed nuts"], // items from active pantry utilized in this plan
  "days": [
    {
      "dayIndex": 1,
      "dateLabel": "e.g., ${dateLabels[0] || "Day 1"}",
      "rawDate": "YYYY-MM-DD format (Day 1 starts on ${startDate}, next dates increment by 1 day)",
      "scheduleNote": "How leftovers, frozen food, or portion-controlled nutrition is managed today",
      "breakfast": {
        "name": "E.g., Yogurt with Berries and Oats",
        "instructions": "Place yogurt, top with oats and berries.",
        "locked": false, // Return the exact locked boolean state provided for this meal (or keep true if was true/edited)
        "edited": false, // Return the exact edited boolean state provided for this meal (or keep true if was edited)
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 5,
        "fiber": 4
      },
      "lunch": {
        "name": "Meal name",
        "instructions": "Instructions.",
        "locked": false,
        "edited": false,
        "calories": 400,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "fiber": 6
      },
      "dinner": {
        "name": "Meal name",
        "instructions": "Instructions.",
        "locked": false,
        "edited": false,
         "calories": 520,
        "protein": 35,
        "carbs": 50,
        "fat": 16,
        "fiber": 8
      },
      "snack": {
        "name": "Meal name",
         "instructions": "Instructions.",
        "locked": false,
        "edited": false,
        "calories": 150,
        "protein": 6,
        "carbs": 18,
        "fat": 5,
        "fiber": 3
      }
    }
  ]
}
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.15,
      }
    });

    let rawText = (response.text || "{}").trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    }

    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (parseErr) {
      console.warn("Raw meal text failed parse:", rawText);
      res.status(500).json({ error: "Failed to parse generated meal plan. Please simplify custom comments." });
    }
  } catch (error: any) {
    console.error("Meals planning error:", error);
    res.status(500).json({ error: "Failed to generate meals" });
  }
});

// Endpoint to edit an existing meal plan based on natural language instruction
app.post("/api/edit-meal-plan", async (req, res) => {
  try {
    const { currentMealPlan, editCommand, pantryList = [] } = req.body;

    if (!editCommand) {
      return res.status(400).json({ error: "Edit command is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is required" });
    }

    const currentPlanStr = JSON.stringify(currentMealPlan);
    const pantryString = pantryList.length > 0
      ? pantryList.map((p: any) => `* ${p.name} (Qty: ${p.qty || "some"}${p.notes ? `, notes: ${p.notes}` : ""}, GF: ${p.isGlutenFree || false})`).join("\n")
      : "Empty pantry";

    const prompt = `
You are Bliss, the cooking companion edits helper.
You are given an active meal plan and a specific user command to edit details of it.
Your mission is to perform this edit perfectly while keeping the rest of the meal plan unmodified. Ensure the formatting remains identical.

## User's Edit Instruction:
"${editCommand}"

## Current Pantry Stock Context:
${pantryString}

## Current Meal Plan Object:
${currentPlanStr}

Your response must be the updated complete JSON object incorporating ONLY the requested edits.
Ensure the response matches the exact JSON schema of the current plan. It must contain the fields: "title", "days" (with breakfast, lunch, dinner, snack for every day), "pantryCompleteness", "pantryUtilization", and "groceryTiers" (with updated cost calculations or ingredients if the edit changed what we need to purchase).
Do NOT wrap in markdown or backticks. Start with { and end with }.
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1, // low temperature for precise modification
      }
    });

    let rawText = (response.text || "{}").trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    }

    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (parseErr) {
      console.warn("Edit meal plan text failed parse:", rawText);
      res.status(500).json({ error: "Failed to parse modified meal plan." });
    }
  } catch (error: any) {
    console.error("Edit meal plan error:", error);
    res.status(500).json({ error: "Failed to modify meal plan" });
  }
});


// Endpoint to fetch full daily readings resiliently using Gemini
app.post("/api/readings", async (req, res) => {
  try {
    const { date, type, userContext } = req.body;

    if (!date || !type) {
      return res.status(400).json({ error: "Date and reading type are required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is required" });
    }

    const typeLabels: Record<string, string> = {
      aa: "AA Daily Reflections (Alcoholics Anonymous)",
      letting_go: "The Language of Letting Go by Melody Beattie",
      oa: "Overeaters Anonymous (OA) Daily Readings, Voices of Recovery, or For Today"
    };

    const label = typeLabels[type] || type;

    const prompt = `
Retrieve and compile the absolute COMPLETE, AUTHENTIC, FULL TEXT daily reading for the date "${date}" for the recovery book or philosophy: "${label}".
Do not summarize. Do not give an excerpt or a short quote. We require the complete essay, matching the authentic style and text of that day's entry.

The response MUST be a JSON object containing this structure (do NOT wrap in markdown, start with { and end with }):
{
  "title": "Clear elegant title of the day's entry",
  "date": "Specified date (e.g., ${date})",
  "quote": "The opening quote or scripture if applicable (omit or keep brief if none)",
  "text": "The COMPLETE, FULL-LENGTH reading. This must contain the full essays, paragraphs, and lessons of the entry. Do not abbreviate or say [truncated].",
  "focus": "The final focus statement, prayer, or resolution for the day"
}
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });

    let rawText = (response.text || "{}").trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    }

    const parsed = JSON.parse(rawText);
    res.json(parsed);

  } catch (error: any) {
    console.error("Readings retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve the full daily reading." });
  }
});

// Endpoint to generate personal morning affirmations based on status
app.post("/api/affirmation", async (req, res) => {
  try {
    const { energy, anxiety, userContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is required" });
    }

    const userName = userContext === "Rhon" ? "Rhonda (AA direction, Gluten-free, losing weight)" : "Susan (OA direction, Wegovy support)";

    const prompt = `
You are Bliss, the comforting, uplifting recovery companion for Rhon and Suz.
Generate a highly personalized, warm, encouraging daily affirmation (1 to 2 sentences) for ${userName} based on today's state:
- Today's Energy: ${energy}/10 (Higher is stronger/more energized, lower is tired/fatigued)
- Today's Anxiety: ${anxiety}/10 (Higher is more worried/anxious, lower is calm/peaceful)

Incorporate their recovery goals gracefully. Direct your tone directly to the user in a caring, supportive character voice.
Keep it powerful and short. Do not include markdown headers or extra conversation.
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.85
      }
    });

    res.json({ affirmation: (response.text || "").trim() });

  } catch (error: any) {
    console.error("Affirmation generation error:", error);
    res.json({ affirmation: "Take one breath at a time today, friend. Progress, not perfection!" });
  }
});


// Endpoint to parse natural language food logs
app.post("/api/food-log", async (req, res) => {
  try {
    const { logText, userContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is required" });
    }

    const userName = userContext === "Rhon" ? "Rhonda (gluten-free, losing weight)" : "Susan (OA direction, Wegovy)";

    const prompt = `
You are Bliss, the cooking and nutrition assistant for ${userName}.
The user has provided a natural language summary of what they ate today:
"${logText}"

Please parse this text and intelligently group the food items into Breakfast, Lunch, Dinner, and Snacks based on standard time-of-day food types if they didn't explicitly specify times. If they just listed food, make your best guess.
Also, estimate the TOTAL calories for everything listed. Keep it approximate but realistic.

Return the result STRICTLY as a JSON object matching this schema, completely without markdown wrapping:
{
  "breakfast": "string (comma separated list of items)",
  "lunch": "string",
  "dinner": "string",
  "snacks": "string",
  "estimatedCalories": 0
}
    `;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2
      }
    });

    let rawJson = response.text || "{}";
    rawJson = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawJson);
    res.json(parsed);

  } catch (error: any) {
    console.error("Food log parsing error:", error);
    res.status(500).json({ error: "Failed to parse food log" });
  }
});

// Primary Chat API for Bliss
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      userContext = "rhon", 
      profileData = {}, 
      pantryList = [], 
      winsList = [],
      recentCheckIn = null,
      mode = "normal" // "normal" or "help" (Bliss, help mode!)
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful error if API Key is missing
      return res.json({
        reply: "Hey friend, looks like the GEMINI_API_KEY isn't set up yet! 💛 Ask Rhon to double-check that in the Secrets tab so we can chat proper.",
        isSystemMessage: true
      });
    }

    // Build pantry details for prompt context
    const pantryContent = pantryList.length > 0 
      ? pantryList.map((p: any) => `- ${p.name} (ID: ${p.id}, Qty: ${p.qty || "some"}${p.notes ? `, notes: ${p.notes}` : ""}, GF: ${p.isGlutenFree || false})`).join("\n")
      : "Pantry is currently empty or not logged.";

    // Build wins list
    const winsContent = winsList.length > 0
      ? winsList.map((w: any) => `- [${w.user}] ${w.text} (${w.date})`).join("\n")
      : "No wins elements recorded today yet.";

    // Build specific user profile summary
    const userName = userContext === "rhon" ? "Rhon" : userContext === "suz" ? "Suz" : "Rhon & Suz";
    
    let activeUserSpecs = "";
    if (userContext === "rhon") {
      activeUserSpecs = `
User focuses: Rhon (47, female, active lifestyle, gluten-free, low sugar, AA 15-years member, Vyvanse user, goal is to lose 20 lbs sustainably, self-critical, needs encouragement, loves voice/convos).
`;
    } else if (userContext === "suz") {
      activeUserSpecs = `
User focuses: Suz (Rhon's wife, Overeaters Anonymous member, Wegovy user, loves cooking, shares kitchen/meals, needs individualized portions).
`;
    } else {
      activeUserSpecs = `
Couple Focus: Rhon & Suz are a solid team! Rhon (AA, 47, GF, losing 20lbs) and Suz (OA, Wegovy, loves cooking) dining and living more balanced together.
`;
    }

    // Help Mode vs Normal Mode
    let moodFocus = "";
    if (mode === "help" || message.toLowerCase().includes("bliss, help")) {
      moodFocus = `
ALERT: "Bliss, help!" mood activated. Put coaching rules on standby and switch directly into high-support mode.
1. Be extremely reassuring, direct, loving, and calm.
2. Ask her what's going on.
3. Validate and check scale of intensity.
Keep it bite-sized, structured, and extremely companion-like.
`;
    }

    // Direct, task-focused, non-repetitive response prompt
    const systemInstruction = `
You are Blessy, the supportive, task-focused, calm and direct AI assistant inside the "Friend4Life" application.

## YOUR ROLE & PERSONALITY
- You are Blessy.
- Speak in a warm, direct, encouraging, clear, and caring feminine voice.
- STRICTLY FORBIDDEN: Do not over-explain, do NOT lecture, do NOT make long dialogue/conversations, do NOT act as an unrequested planner, and do NOT suggest alternatives when the user gives an instruction.
- Be task-based: follow instructions directly. Execute tasks cleanly and immediately.
- If the user says something, treat it as a direct instruction, not a philosophical discussion.
- Answer questions directly and concisely.

## CRITICAL MEAL COMPANION & RELATIONSHIP RULES (MANDATORY)
- Do NOT assume family relationships or make guesses about the kitchen users' connections.
- STRICTLY FORBIDDEN: Do not use the terms "Sister", "Sisters", "Sister's meals", "Sister Meal Plan", "Brother", "Brothers", "Sibling", "Siblings", "Family Member" etc. Refer to them strictly by their name "Rhonda" (or "Rhon") and "Susan" (or "Suz"). Keep relationships completely factual based on user context.

## CURRENT ACTIVE PANTRY
Our shared real-time pantry inventory consists of these actual items:
${pantryContent}

## REAL-TIME ACTIONS & UTILITIES
If the user asks you to:
- Add food or item(s) to their pantry (e.g., "Add Eggs to pantry", "put Almond flour in my pantry", "add milk and bread")
- Delete or remove item(s) from their pantry (e.g., "Delete Eggs", "remove milk")
- Update or change item details/quantities
- Clear or wipe the pantry (e.g., "clear pantry", "reset my kitchen")

You MUST perform this action directly on the active pantry list and return the complete updated array of pantry items as "updatedPantry" in the JSON response format below.
- Adding item: Generate a unique ID like "pt_man_xxxx" where 'xxxx' is unique. Assign the item name. The category must be one of: "Proteins", "Produce", "Dairy", "Frozen Foods", "Grains & Starches", "Pantry Staples", "Snacks" (choose the most logical). Set quantity as "Present" or what was requested. If the current user context is "rhon", set isGlutenFree: true.
- Deleting item: Filter the list to exclude the item by name or matching substring.
- Clearing pantry: Set target array empty.

${activeUserSpecs}
${moodFocus}
- Active wins in journal today:
${winsContent}

- Current user name requesting: ${userName}

## OUTPUT FORMAT (MANDATORY STRUCTURE)
You MUST output your response strictly as a single JSON object. Do not wrap it in markdown block fences or backticks.
Schema structure:
{
  "reply": "Blessy's direct response text to the user. Keep it very short, direct, task-focused and clear. No verbose preambles.",
  "updatedPantry": [...the full adjusted/synchronized array of pantry items if changed, or null/unchanged if no pantry modifications were requested. MUST follow exactly the PantryItem schema: { id: string, name: string, qty: string, category: "Proteins" | "Produce" | "Dairy" | "Frozen Foods" | "Grains & Starches" | "Pantry Staples" | "Snacks", notes: string, isGlutenFree?: boolean }]
}
`;

    // Map history to standard contents for Gemini SDK (role: 'user' | 'model')
    const contents: any[] = [];
    
    // Add history
    history.forEach((msg: any) => {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    });

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Call Gemini resiliently using multiple fallback models and retries
    const response = await generateContentWithRetryAndFallback(ai, {
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // low temp for robust JSON execution
      }
    });

    let rawText = (response.text || "{}").trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    }

    try {
      const parsed = JSON.parse(rawText);
      res.json({
        reply: parsed.reply || "Done! I've updated that for you.",
        updatedPantry: parsed.updatedPantry || null
      });
    } catch (err) {
      console.warn("Could not parse Blessy JSON answer, raw:", rawText);
      res.json({ reply: rawText, updatedPantry: null });
    }

  } catch (error: any) {
    const rawMsg = error?.message || String(error);
    const safeMsg = rawMsg.replace(/"error"/gi, '"err"').replace(/"message"/gi, '"msg"');
    console.log(`[Bliss API] fail gracefully on chat dispatch: ${safeMsg}`);
    
    res.json({ 
      reply: "Hey friend! I'm here. Could you tell me what you need again? 💛",
      updatedPantry: null
    });
  }
});

// Serve static elements or Vite dev middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Friend4Life Backend server booted on port ${PORT}`);
  });
}

startServer();
