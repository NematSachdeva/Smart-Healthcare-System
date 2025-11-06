require('dotenv').config();
const OpenAI = require('openai');

/**
 * Script to test OpenAI API connection
 * Usage: node scripts/testOpenAI.js
 */

const testOpenAI = async () => {
  try {
    console.log('🔑 Checking OpenAI API Key...');
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('❌ OPENAI_API_KEY not found in .env file\n');
      console.log('Please add your OpenAI API key to backend/.env:');
      console.log('OPENAI_API_KEY=sk-proj-your-key-here\n');
      process.exit(1);
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 20) + '...\n');
    
    console.log('🔌 Testing OpenAI API connection...');
    
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Test with a simple completion
    console.log('📡 Sending test request to OpenAI...\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with a simple greeting.'
        },
        {
          role: 'user',
          content: 'Hello!'
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    });
    
    console.log('✅ OpenAI API connection successful!\n');
    console.log('═══════════════════════════════════════');
    console.log('Response from OpenAI:');
    console.log(response.choices[0].message.content);
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 Usage Information:');
    console.log('Model:', response.model);
    console.log('Tokens used:', response.usage.total_tokens);
    console.log('  - Prompt tokens:', response.usage.prompt_tokens);
    console.log('  - Completion tokens:', response.usage.completion_tokens);
    console.log('\n✅ Your OpenAI API is working correctly!\n');
    
    process.exit(0);
  } catch (error) {
    console.log('\n❌ OpenAI API Error:\n');
    
    if (error.status === 401) {
      console.log('🔑 Authentication Error (401)');
      console.log('Your API key is invalid or has been revoked.\n');
      console.log('Solutions:');
      console.log('1. Check your API key at: https://platform.openai.com/api-keys');
      console.log('2. Generate a new API key if needed');
      console.log('3. Update OPENAI_API_KEY in backend/.env\n');
    } else if (error.status === 429) {
      console.log('⚠️  Rate Limit Error (429)');
      console.log('You have exceeded your API rate limit or quota.\n');
      console.log('Solutions:');
      console.log('1. Check your usage at: https://platform.openai.com/usage');
      console.log('2. Add credits to your account');
      console.log('3. Wait a few minutes and try again\n');
    } else if (error.status === 500 || error.status === 503) {
      console.log('🔧 OpenAI Server Error (' + error.status + ')');
      console.log('OpenAI servers are experiencing issues.\n');
      console.log('Solutions:');
      console.log('1. Check OpenAI status: https://status.openai.com/');
      console.log('2. Wait a few minutes and try again\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('🌐 Network Error');
      console.log('Cannot connect to OpenAI servers.\n');
      console.log('Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Check if you are behind a firewall/proxy');
      console.log('3. Try again in a few minutes\n');
    } else {
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
      console.log('\n');
    }
    
    console.log('Full error details:');
    console.log(error);
    console.log('\n');
    
    process.exit(1);
  }
};

// Run the test
console.log('\n🧪 OpenAI API Connection Test\n');
testOpenAI();
