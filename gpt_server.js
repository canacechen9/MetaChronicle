// Import the required packages
const express = require('express');
const cors = require('cors');  // Import CORS package
const { OpenAI } = require('openai');
require('dotenv').config();  // Load environment variables

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware (Make sure it's placed after app is initialized)
app.use(cors());  // Enable CORS for all routes

// Middleware to parse incoming JSON data
app.use(express.json());

// Initialize OpenAI client with the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Secure API key from .env
});

// Define a POST route to handle the request from p5.js frontend
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;  // Get the prompt from the frontend request

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    // Send the response back to the frontend
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Error generating response from OpenAI' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
