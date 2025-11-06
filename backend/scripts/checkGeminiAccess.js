require('dotenv').config();
const axios = require('axios');

/**
 * Check Gemini API access and list available models
 */

const checkAccess = async () => {
  try {
    console.log('\n🔍 Checking Gemini API Access\n');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('❌ GEMINI_API_KEY not found in .env\n');
      process.exit(1);
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 15) + '...\n');
    
    // Try to list available models
    console.log('📋 Attempting to list available models...\n');
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ API Access Confirmed!\n');
      console.log('Available Models:');
      console.log('═══════════════════════════════════════\n');
      
      if (response.data.models && response.data.models.length > 0) {
        response.data.models.forEach(model => {
          console.log(`📦 ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Supported: ${model.supportedGenerationMethods?.join(', ')}`);
          console.log('');
        });
        
        console.log('✅ Your API key has access to Gemini models!\n');
        console.log('💡 Use one of the model names above in your code.\n');
      } else {
        console.log('⚠️  No models found. This might mean:\n');
        console.log('1. Generative Language API is not enabled');
        console.log('2. API key does not have proper permissions');
        console.log('3. Billing is not set up\n');
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.log(`❌ API Error (Status ${status}):\n`);
        
        if (status === 403) {
          console.log('🔒 Permission Denied\n');
          console.log('This means:');
          console.log('1. ❌ Generative Language API is NOT enabled');
          console.log('2. ❌ Or API key does not have access\n');
          console.log('📝 To fix:');
          console.log('1. Go to: https://console.cloud.google.com/apis/library');
          console.log('2. Search: "Generative Language API"');
          console.log('3. Click "ENABLE"');
          console.log('4. Wait 1-2 minutes');
          console.log('5. Run this script again\n');
        } else if (status === 400) {
          console.log('⚠️  Bad Request\n');
          console.log('Error:', errorData.error?.message);
          console.log('\nYour API key might be invalid or malformed.\n');
        } else if (status === 429) {
          console.log('⚠️  Quota Exceeded\n');
          console.log('You\'ve hit the API rate limit or quota.\n');
        } else {
          console.log('Error:', errorData.error?.message || 'Unknown error');
          console.log('\nFull error:', JSON.stringify(errorData, null, 2));
        }
      } else {
        console.log('❌ Network Error:', error.message);
        console.log('\nCheck your internet connection.\n');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
};

checkAccess();
