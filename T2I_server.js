const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { OpenAI } = require('openai');
const FormData = require('form-data');
const fs = require("node:fs");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());  // To parse JSON body

// API Keys
// Initialize OpenAI client with the API key from .env
const openaiApiKey = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Secure API key from .env
});
const stableDiffusionApiKey = process.env.STABLE_DIFFUSION_API_KEY;
// Generate prompt using ChatGPT
async function generatePrompt(userInput) {
  const response = await openaiApiKey.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: userInput }],
  });
  return response.choices[0].message.content;
}

// Generate image from Stable Diffusion using Stability AI API
async function generateImageFromPrompt(generatedPrompt) {
  //console.log('API Key:', stableDiffusionApiKey);

  const payload = {
    prompt: generatedPrompt,        // Prompt for the image
    aspect_ratio: "16:9",   
  };
  
  const response = await axios.postForm(
    'https://api.stability.ai/v2beta/stable-image/generate/sd3',  // Endpoint
    axios.toFormData(payload, new FormData()),
    {
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${stableDiffusionApiKey}`,  // API key for Stability AI
          Accept: "application/json" 
      },
    }
  );
   // Generate image with Stable Diffusion
  // Assuming response.data contains the image URL under `image_url`
  return response.data;
}

// Route to generate prompt and image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;  // Get the prompt from the frontend request

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const userInput = req.body.prompt;  // The input provided by the user
    const generatedPrompt = await generatePrompt(userInput);
    console.log("Generating image....")  // Generate prompt with ChatGPT
    const imageData = await generateImageFromPrompt(generatedPrompt); 
    console.log("Image generated....") 
    res.json({ prompt: generatedPrompt, image: `data:image/png;base64, ${imageData.image}` }); // Send the prompt and image URL back to frontend
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating prompt or image' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});