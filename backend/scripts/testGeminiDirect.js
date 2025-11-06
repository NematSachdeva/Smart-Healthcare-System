require('dotenv').config();
const axios = require('axios');

/**
 * Test Gemini API using direct HTTP calls
 */

const testGeminiDirect = async () => {
  try {
    console.log('\n🧪 Testing Gemini API (Direct HTTP)\n');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('❌ GEMINI_API_KEY not found in .env\n');
      process.exit(1);
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...\n');
    
    const modelsToTry = [
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest', 
      'gemini-pro'
    ];
    
    console.log('🔍 Testing different models...\n');
    
    for (const model of modelsToTry) {
      try {
        console.log(`Testing ${model}...`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, {
          contents: [{
            parts: [{
              text: 'Say hello in one sentence.'
            }]
          }]
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        const text = response.data.candidates[0].content.parts[0].text;
        
        console.log(`✅ ${model} WORKS!`);
        console.log(`Response: ${text}\n`);
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${model} - Status ${error.response.status}: ${error.response.data.error?.message || 'Failed'}\n`);
        } else {
          console.log(`❌ ${model} - ${error.message}\n`);
        }
      }
    }
    
    console.log('Test complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testGeminiDirect();
