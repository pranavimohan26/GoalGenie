import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  console.warn('WARNING: OPENAI_API_KEY is not set or using default value. AI features will run in mock fallback mode.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-for-development-fallback',
});

export const isAiMockMode = !apiKey || apiKey === 'your_openai_api_key_here';
