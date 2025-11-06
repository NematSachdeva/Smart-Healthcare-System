const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini AI Service for prescription generation
 * Uses Google's Gemini API instead of OpenAI
 */

class GeminiAIService {
  constructor() {
    // Initialize Gemini client with API key from environment variables
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try gemini-pro model (most compatible)
    this.modelName = 'gemini-pro';
    
    console.log('✅ Gemini AI Service initialized');
  }
  
  getModel() {
    return this.genAI.getGenerativeModel({ model: this.modelName });
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

      // Construct prompt for Gemini
      const prompt = `You are a medical AI assistant helping doctors create prescription drafts.

Patient Information:
- Age: ${age}
- Gender: ${gender}
- Medical History: ${medicalHistory || 'None reported'}
- Current Symptoms: ${symptoms}

Generate a structured prescription based on the patient's symptoms and medical history.

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "diagnosis": "Likely diagnosis based on symptoms",
  "medications": [
    {
      "name": "Medication name",
      "dosage": "Amount per dose",
      "frequency": "How often to take (e.g., twice daily)",
      "duration": "How long to take (e.g., 7 days)"
    }
  ],
  "advice": "Lifestyle recommendations and precautions",
  "followUp": "When to schedule next appointment"
}

Provide 1-3 appropriate medications. Be specific with dosages and frequencies.`;

      console.log('🤖 Generating prescription with Gemini AI...');

      // Get model instance
      const model = this.getModel();
      
      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
          diagnosis: "Unable to parse AI response",
          medications: [
            {
              name: "Please review and edit",
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
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Gemini API quota exceeded. Please check your usage at https://makersuite.google.com/');
      } else if (error.message.includes('SAFETY')) {
        throw new Error('Content was blocked by safety filters. Please try with different symptoms.');
      }
      
      throw new Error(`Failed to generate prescription: ${error.message}`);
    }
  }
}

module.exports = new GeminiAIService();
