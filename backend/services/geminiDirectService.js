const axios = require('axios');

/**
 * Gemini AI Service using direct HTTP API calls
 * This bypasses SDK issues and uses the REST API directly
 */

class GeminiDirectService {
  constructor() {
    // Load dotenv with explicit path
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    
    console.log('✅ Gemini 2.0 Flash AI Service initialized');
    console.log(`🔑 API Key: ${this.apiKey ? 'Configured' : 'Missing'}`);
  }

  /**
   * Generate prescription draft based on patient data and symptoms
   * @param {Object} patientData - Patient information (age, gender, medicalHistory)
   * @param {string} symptoms - Patient symptoms
   * @returns {Promise<Object>} Formatted prescription draft object
   */
  async generatePrescription(patientData, symptoms) {
    try {
      const { age, gender, medicalHistory } = patientData;

      // Construct prompt for Gemini 2.0 Flash
      const prompt = `You are an expert medical AI assistant helping doctors create accurate prescription drafts.

Patient Information:
- Age: ${age} years old
- Gender: ${gender}
- Medical History: ${medicalHistory || 'None reported'}
- Current Symptoms: ${symptoms}

Task: Generate a comprehensive, medically accurate prescription based on the patient's symptoms and medical history.

CRITICAL: Respond ONLY with valid JSON (no markdown, no code blocks, no explanations - just pure JSON):

{
  "diagnosis": "Primary diagnosis based on symptoms (be specific)",
  "medications": [
    {
      "name": "Generic medication name",
      "dosage": "Specific amount (e.g., 500mg, 10ml)",
      "frequency": "Exact timing (e.g., Every 8 hours, Twice daily after meals)",
      "duration": "Treatment period (e.g., 5-7 days, 2 weeks)"
    }
  ],
  "advice": "Detailed lifestyle recommendations, dietary advice, precautions, and warning signs to watch for",
  "followUp": "Specific follow-up recommendation (e.g., Return in 3-5 days if symptoms persist, Schedule follow-up in 2 weeks)"
}

Guidelines:
- Provide 1-3 appropriate medications based on symptoms
- Use generic medication names
- Be specific with dosages appropriate for age and condition
- Include clear frequency and duration
- Consider patient's age and medical history
- Provide practical, actionable advice
- Include warning signs that require immediate medical attention`;

      console.log('🤖 Generating prescription with Gemini 2.0 Flash AI...');

      // Using Gemini 2.0 Flash model for fast, intelligent prescription generation
      const modelsToTry = [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      let response;
      let lastError;

      for (const model of modelsToTry) {
        try {
          const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
          
          response = await axios.post(url, {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          console.log(`✅ Successfully used model: ${model}`);
          break; // Success, exit loop
        } catch (error) {
          console.log(`❌ Model ${model} failed, trying next...`);
          lastError = error;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('All Gemini models failed');
      }

      const text = response.data.candidates[0].content.parts[0].text;
      console.log('📝 Gemini response received');

      // Parse the JSON response
      let prescriptionData;
      try {
        // Remove markdown code blocks if present
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        prescriptionData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', text);
        
        // Fallback: create structured response from text
        prescriptionData = {
          diagnosis: "AI-generated diagnosis",
          medications: [
            {
              name: "Please review AI response",
              dosage: "N/A",
              frequency: "N/A",
              duration: "N/A"
            }
          ],
          advice: text.substring(0, 500),
          followUp: "Please review with patient"
        };
      }

      // Validate the response structure
      if (!prescriptionData.diagnosis || !prescriptionData.medications) {
        throw new Error('Invalid prescription format from AI');
      }

      console.log('✅ Prescription generated successfully');
      return prescriptionData;

    } catch (error) {
      console.error('❌ Gemini AI Error:', error.message);
      
      // Provide helpful error messages
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 400) {
          throw new Error(`Gemini API error: ${errorData.error?.message || 'Bad request'}`);
        } else if (status === 403 || status === 401) {
          throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file');
        } else if (status === 404) {
          throw new Error('Gemini model not found. Your API key may not have access to Gemini models.');
        } else if (status === 429) {
          throw new Error('Gemini API quota exceeded. Please check your usage or upgrade your plan.');
        }
      }
      
      throw new Error(`Failed to generate prescription: ${error.message}`);
    }
  }
}

module.exports = new GeminiDirectService();
