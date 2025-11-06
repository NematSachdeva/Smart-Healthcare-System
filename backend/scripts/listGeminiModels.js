require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Script to list available Gemini models
 * Usage: node scripts/listGeminiModels.js
 */

const listModels = async () => {
  try {
    console.log('\n📋 Listing Available Gemini Models\n');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('❌ GEMINI_API_KEY not found in .env file\n');
      process.exit(1);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔍 Fetching available models...\n');
    
    // Try different model names that might work
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    console.log('Testing models:\n');
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        console.log(`✅ ${modelName} - WORKS!`);
      } catch (error) {
        console.log(`❌ ${modelName} - Not available`);
      }
    }
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listModels();
