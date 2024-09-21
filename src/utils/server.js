const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenerativeAI, GoogleGenerativeAIFetchError } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

console.log('Environment variables loaded:', process.env.DB_HOST ? 'Yes' : 'No');
console.log('Current working directory:', process.cwd());

const app = express();

app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data: http://localhost:3001; style-src 'self' 'unsafe-inline'"
  );
  next();
});

console.log('Database connection details:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER
});

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Updated PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Use this only if you're having issues with self-signed certificates
    sslmode: 'require'
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to database:', result.rows[0]);
  });
});

// Set up Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function queryDatabase(query) {
  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getDatabaseInfo() {
    const tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
    const tables = await queryDatabase(tablesQuery);
  
    let dbInfo = {
      tables: []
    };
  
    for (const table of tables) {
      const tableInfo = {
        name: table.table_name,
        columns: [],
        sampleData: []
      };
  
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          (SELECT COUNT(*) FROM information_schema.key_column_usage 
           WHERE table_name = c.table_name AND column_name = c.column_name) > 0 AS is_key
        FROM information_schema.columns c
        WHERE table_name = '${table.table_name}'
      `;
      const columns = await queryDatabase(columnsQuery);
  
      for (const column of columns) {
        tableInfo.columns.push({
          name: column.column_name,
          type: column.data_type,
          nullable: column.is_nullable === 'YES',
          default: column.column_default,
          isKey: column.is_key
        });
      }
  
      // Fetch sample data
      const sampleDataQuery = `SELECT * FROM "${table.table_name}" LIMIT 5`;
      const sampleData = await queryDatabase(sampleDataQuery);
      tableInfo.sampleData = sampleData;
  
      dbInfo.tables.push(tableInfo);
    }
  
    return JSON.stringify(dbInfo, null, 2);
  }

app.post('/api/chat', async (req, res) => {
    try {
      const userInput = req.body.message;
  
      // Validate user input
      if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'Invalid input. Please provide a valid message.' });
      }
  
      // Get database info
      let dbInfo;
      try {
        dbInfo = await getDatabaseInfo();
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Error fetching database information. Please check your database connection.' });
      }
  
      // Generate Gemini response
      const prompt = `
  You are an AI assistant with access to a PostgreSQL database. Here's the structure of the database and some sample data in JSON format:
  
  ${dbInfo}
  
  Please use this information to answer the following user question. Provide your answer in natural language, based on the database structure and the sample data provided. If the exact information is not available in the sample data, make it clear that you're basing your response on limited sample data and the actual result may vary.
  
  User question: ${userInput}
  
  Response:`;
  
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (geminiError) {
        if (geminiError instanceof GoogleGenerativeAIFetchError && geminiError.status === 400 && geminiError.errorDetails[0].reason === 'API_KEY_INVALID') {
          console.error('Invalid API key. Please check the API key and try again.');
          return res.status(400).json({ error: 'Invalid API key. Please check the API key and try again.' });
        } else {
          console.error('Gemini API error:', geminiError);
          return res.status(500).json({ error: 'Error generating response from Gemini. Please check your API key and permissions.' });
        }
      }
  
      const response = result.response.text();
      res.json({ response });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
  });
  
  // Serve React app in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }
  

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
