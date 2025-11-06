require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Script to test Google Gemini API connection
 * Usage: node scripts/testGemini.js
 */

const testGemini = async () => {
  try {
    console.log('\n🧪 Google Gemini API Connection Test\n');
    console.log('🔑 Checking Gemini API Key...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('❌ GEMINI_API_KEY not found or not set in .env file\n');
      console.log('Please add your Gemini API key to backend/.env:');
      console.log('GEMINI_API_KEY=AIza...\n');
      console.log('Get your free API key at: https://makersuite.google.com/app/apikey\n');
      process.exit(1);
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...\n');
    
    console.log('🔌 Testing Gemini API connection...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Test with a simple prompt
    console.log('📡 Sending test request to Gemini...\n');
    
    const result = await model.generateContent('Say hello in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API connection successful!\n');
    console.log('═══════════════════════════════════════');
    console.log('Response from Gemini:');
    console.log(text);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ Your Gemini API is working correctly!\n');
    console.log('💰 Gemini API is FREE for moderate usage!');
    console.log('📊 Check usage at: https://makersuite.google.com/\n');
    
    process.exit(0);
  } catch (error) {
    console.log('\n❌ Gemini API Error:\n');
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
      console.log('🔑 Invalid API Key');
      console.log('Your Gemini API key is invalid.\n');
      console.log('Solutions:');
      console.log('1. Go to: https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Copy the key (starts with AIza...)');
      console.log('4. Update GEMINI_API_KEY in backend/.env\n');
    } else if (error.message.includes('QUOTA') || error.message.includes('quota')) {
      console.log('⚠️  Quota Exceeded');
      console.log('You have exceeded your Gemini API quota.\n');
      console.log('Solutions:');
      console.log('1. Check usage at: https://makersuite.google.com/');
      console.log('2. Wait for quota to reset (usually daily)');
      console.log('3. Request higher quota if needed\n');
    } else if (error.message.includes('SAFETY')) {
      console.log('🛡️  Safety Filter Triggered');
      console.log('Content was blocked by safety filters.\n');
      console.log('This is normal for the test. Your API key works!\n');
    } else {
      console.log('Error:', error.message);
      console.log('\n');
    }
    
    console.log('Full error details:');
    console.log(error);
    console.log('\n');
    
    process.exit(1);
  }
};

// Run the test
testGemini();
