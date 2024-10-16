import axios from 'axios';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Função para enviar dados para a API da 'moday.com'
async function sendToModay(data: any): Promise<any> {
  const response = await axios.post(process.env.MODAY_API_URL as string, data, {
    headers: {
      'Authorization': `Bearer ${process.env.MODAY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Função para enviar dados para a API do ChatGPT
async function sendToChatGPT(prompt: string): Promise<any> {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Função para enviar dados para o Google Sheets
async function sendToGoogleSheets(auth: any, sheetId: string, range: string, values: any[][]) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: 'RAW',
    requestBody: {
      values: values,
    },
  });
}

// Fluxo principal
async function main() {
  try {
    const modayResponse = await sendToModay({ exampleField: 'exampleValue' });
    
    const chatGptResponse = await sendToChatGPT(modayResponse.dataField);

    // Autenticação OAuth 2.0 para o Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/your-service-account-file.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Dados a serem enviados ao Google Sheets
    const sheetId = process.env.GOOGLE_SHEET_ID as string;
    const range = 'Sheet1!A1';
    const values = [[chatGptResponse.choices[0].message.content]];

    await sendToGoogleSheets(await auth.getClient(), sheetId, range, values);

    console.log('Dados enviados com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o fluxo:', error);
  }
}

main();
