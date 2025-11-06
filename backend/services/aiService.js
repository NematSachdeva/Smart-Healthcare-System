const OpenAI = require('openai');

class AIService {
  constructor() {
    // Initialize OpenAI client with API key from environment variables
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Configure model, maxTokens, and temperature
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = 1000;
    this.temperature = 0.7;
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

      // Construct system prompt defining AI role and response format
      const systemPrompt = `You are a medical AI assistant helping doctors create prescription drafts. 
Generate a structured prescription based on patient symptoms and medical history. 
Include: diagnosis, medications with dosage, frequency, duration, and general advice.
Format the response as JSON with the following structure:
{
  "diagnosis": "string",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string"
    }
  ],
  "advice": "string",
  "followUp": "string"
}`;

      // Construct user prompt with patient information and symptoms
      const userPrompt = `Patient Information:
- Age: ${age}
- Gender: ${gender}
- Medical History: ${medicalHistory || 'None reported'}
- Current Symptoms: ${symptoms}

Generate a prescription draft.`;

      // Call OpenAI chat completions API with prompts
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: 'json_object' }
      });

      // Parse JSON response from AI
      const aiResponse = response.choices[0].message.content;
      const prescriptionDraft = JSON.parse(aiResponse);

      // Return formatted prescription draft object
      return this.formatPrescriptionResponse(prescriptionDraft);
    } catch (error) {
      // Handle AI API failures
      return this.handleAIError(error);
    }
  }

  /**
   * Format prescription response into standardized structure
   * @param {Object} aiResponse - Raw AI response
   * @returns {Object} Formatted prescription object
   */
  formatPrescriptionResponse(aiResponse) {
    return {
      diagnosis: aiResponse.diagnosis || 'Not specified',
      medications: aiResponse.medications || [],
      advice: aiResponse.advice || 'Follow general health guidelines',
      followUp: aiResponse.followUp || 'Schedule follow-up as needed'
    };
  }

  /**
   * Handle AI API errors with user-friendly messages
   * @param {Error} error - Error object from OpenAI API
   * @throws {Error} Formatted error with user-friendly message
   */
  handleAIError(error) {
    // Log errors for debugging
    console.error('AI Service Error:', error.message);
    console.error('Error details:', error);

    // Return user-friendly error messages based on error type
    if (error.code === 'insufficient_quota') {
      throw new Error('AI service quota exceeded. Please contact administrator.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('AI service configuration error. Please contact administrator.');
    } else if (error.status === 429) {
      throw new Error('AI service is currently busy. Please try again in a moment.');
    } else if (error.status >= 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    } else if (error.message.includes('JSON')) {
      // JSON parsing error - implement fallback behavior
      console.error('Failed to parse AI response as JSON');
      throw new Error('AI service returned invalid response. Please try again.');
    } else {
      // Generic error with fallback behavior
      throw new Error('Failed to generate prescription draft. Please try again or create manually.');
    }
  }
}

module.exports = new AIService();
