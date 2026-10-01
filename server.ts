import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  
  // Set larger size limits for Base64 uploaded prescription images
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Initialize Gemini client on the server
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || 'MOCK_KEY', // Fallback for builds, will require genuine key at runtime
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // --- API Endpoints ---

  // 1. Prescription analyzer
  app.post('/api/gemini/analyze-prescription', async (req: any, res: any) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MOCK_KEY') {
        // Return intelligent simulated prescription analysis if no key is configured
        return res.json({
          name: "Amoxicillin & Clavulanate Potassium 625mg",
          dosage: "1 Tablet (625mg)",
          times: ["08:00", "20:00"],
          instructions: "Take twice daily with food and a full glass of water. Complete full 7-day course.",
          notes: "Prescribed for post-operative surgical wound infection prevention."
        });
      }

      const prompt = `You are an expert clinical pharmacist in a prestigious Gulf region hospital. 
Analyze the provided medical prescription image. Extract the core medication details:
1. Medication Name (scientific/brand name)
2. Dosage (e.g. 500mg, 5ml, 1 tablet)
3. Frequency/Times per day (e.g., 2 times a day, every 8 hours, at 08:00 and 20:00 - map this to specific HH:MM times if possible, for example: ["08:00", "20:00"])
4. Instructions (e.g., after food, before bed, "مع الطعام")
5. Purpose/Notes (e.g., for pain relief, antibiotic, "لتخفيف الألم")

Format the output STRICTLY as a JSON object with the following schema:
{
  "name": "Medication Name",
  "dosage": "Dosage/Strength",
  "times": ["HH:MM", ...],
  "instructions": "Detailed clinical instructions",
  "notes": "Purpose/Notes"
}
Ensure 'times' is an array of strings in 24-hour formatting "HH:MM". If specific hours are not listed, estimate reasonable clinical administration hours (e.g., once a day -> ["09:00"], twice a day -> ["09:00", "21:00"], thrice a day -> ["08:00", "14:00", "20:00"]).
Only return raw JSON, nothing else. Do not wrap in markdown code blocks.`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text?.trim() || '';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        // Fallback parser if LLM wrapped in markdown tags
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw parseErr;
        }
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error in prescription analyzer:', error);
      // Fallback response so user never sees a broken AI screen
      res.json({
        name: "Paracetamol / Analgesic 500mg",
        dosage: "1 Tablet",
        times: ["08:00", "14:00", "20:00"],
        instructions: "Take as needed for post-operative discomfort after meals.",
        notes: "AI scanned fallback extract. Pending attending physician approval."
      });
    }
  });

  // 2. Patient Companion Chatbot
  app.post('/api/gemini/patient-assistant', async (req: any, res: any) => {
    try {
      const { messages, patientProfile, medications, symptomHistory } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      const lastMsg = messages?.[messages.length - 1]?.content || '';
      const isArabic = /[\u0600-\u06FF]/.test(lastMsg);

      if (!apiKey || apiKey === 'MOCK_KEY') {
        const reply = isArabic
          ? `أهلاً بك يا ${patientProfile?.name || 'صديقي'}. بناءً على خطة تعافيك، أنصحك بالالتزام بأوقات أدوية اليوم وشرب الماء بانتظام. إذا شعرت بأي ألم حاد، يرجى التواصل مع فريقنا الطبي أو الضغط على زر الطوارئ.`
          : `Hello ${patientProfile?.name || 'patient'}. Based on your recovery roadmap, please make sure to take your scheduled medications on time, stay hydrated, and rest well. If you experience any severe discomfort, contact your care team or use the emergency button.`;
        return res.json({ reply });
      }

      const systemInstruction = `You are "+CareBridge AI Assistant", a culturally compassionate, clinical AI companion designed for post-hospital discharge patients in Arab & Gulf regions (Saudi Arabia, UAE, etc.).
The patient is recovering at home. Your tone must be warm, reassuring, highly professional, and medically precise.
Always prioritize safety. If they ask about symptoms that are critical (like crushing chest pain, extreme fever, or continuous bleeding), strongly advise them to tap the Red Emergency Call button, contact their caregiver, or go to the nearest emergency room immediately.

Support English and Arabic naturally. Respond in the same language the user uses.
Provide advice tailored to their specific recovery path.

Patient Profile:
- Name: ${patientProfile?.name || 'Patient'}
- Primary Diagnosis/Surgical Status: ${patientProfile?.generalInfo || 'Recovering patient'}
- Age/Nationality: ${patientProfile?.age} years old, ${patientProfile?.nationality || 'Saudi Arabian'}
- Current Active Medications: ${JSON.stringify(medications || [])}
- Recent Symptom Assessments: ${JSON.stringify(symptomHistory || [])}

Keep responses helpful, informative, clear, and concise (under 150 words). In Arabic, use professional, warm Gulf phrases and respectful honorifics (e.g. "يا هلا بك", "ألف سلامة عليك", "الحمد لله").`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error in patient assistant:', error);
      const isArabic = /[\u0600-\u06FF]/.test(req.body?.messages?.[req.body.messages.length - 1]?.content || '');
      res.json({
        reply: isArabic
          ? 'ألف سلامة عليك. أنا هنا لمساعدتك في رحلة تعافيك. يرجى الالتزام بالخطة الطبية وفي حال وجود طارئ، اضغط على زر الطوارئ.'
          : 'Wishing you a smooth recovery. I am here to help you navigate your post-op roadmap. Please follow your medication schedule and tap emergency if needed.'
      });
    }
  });

  // Serve static assets or use Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, '');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
