---
title: Build Your First AI Chatbot in 30 Minutes
date: 2024-02-12
author: Your Name
tags: [Tutorial, Chatbot, JavaScript, OpenAI]
excerpt: A step-by-step guide to building a simple but powerful AI chatbot using JavaScript and the OpenAI API.
---

# Build Your First AI Chatbot in 30 Minutes

Want to build a chatbot that can actually understand and respond intelligently to users? In this tutorial, we'll create a simple but powerful chatbot using JavaScript and the OpenAI API.

## Prerequisites

- Basic JavaScript knowledge
- Node.js installed
- OpenAI API key
- 30 minutes of free time

## Project Setup

First, create a new directory and initialize your project:

```bash
mkdir ai-chatbot
cd ai-chatbot
npm init -y
npm install express openai dotenv cors
```

Create the following file structure:

```
ai-chatbot/
├── .env
├── server.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
```

## Setting Up the Server

Create `server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message }
            ],
        });

        res.json({ 
            reply: completion.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Creating the Frontend

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chatbot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
            <div class="message bot">
                Hello! How can I help you today?
            </div>
        </div>
        <div class="chat-input">
            <input type="text" id="user-input" 
                   placeholder="Type your message...">
            <button id="send-button">Send</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

Add styles in `public/style.css`:

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

.chat-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
}

.chat-messages {
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
}

.message {
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 15px;
    max-width: 80%;
}

.user {
    background: #007AFF;
    color: white;
    margin-left: auto;
}

.bot {
    background: #F0F0F0;
    color: #333;
}

.chat-input {
    display: flex;
    padding: 20px;
    border-top: 1px solid #eee;
}

input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    margin-right: 10px;
}

button {
    padding: 10px 20px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

button:hover {
    background: #0056b3;
}
```

Add the JavaScript in `public/script.js`:

```javascript
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        addMessage(data.reply);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, something went wrong. Please try again.');
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
```

## Running the Chatbot

1. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

2. Start the server:
```bash
node server.js
```

3. Visit `http://localhost:3000` in your browser

## Customizing Your Chatbot

You can customize the chatbot's personality by modifying the system message in `server.js`:

```javascript
{ role: "system", content: "You are a friendly customer service representative..." }
```

## Next Steps

To enhance your chatbot, consider:

1. Adding conversation history
2. Implementing typing indicators
3. Adding error handling and retry logic
4. Customizing the UI design
5. Adding support for images or files

## Conclusion

You now have a working AI chatbot! This is just the beginning - you can extend its capabilities by adding features like conversation memory, different personalities, or specific domain knowledge.

Remember to handle your API key securely and implement proper rate limiting in a production environment. 