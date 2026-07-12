/**
 * Gemini AI Helper for parsing invoices/receipts
 */

export interface ExtractedAssetData {
  name: string;
  category: string;
  acquisitionCost: number;
  serialNumber: string;
  acquisitionDate: string;
  location?: string;
  supplier?: string;
}

export async function parseInvoiceWithGemini(
  base64Data: string,
  mimeType: string,
  customApiKey?: string
): Promise<ExtractedAssetData> {
  const apiKey = customApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please configure it in your environment or provide it directly.');
  }

  // Define the API endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Build the prompt instruction
  const prompt = `You are an expert procurement and asset management assistant.
Extract the following information from the provided invoice or receipt image/document.
Return a JSON object containing the exact fields defined in the schema.
Choose the best matching category for the asset from these options: "Electronics", "Furniture", "Vehicles", "Shared Spaces".
If you cannot identify a good category, choose the closest or use "Electronics" for gadgets/computers.
For date fields, format as YYYY-MM-DD. For acquisition cost, return a clean number without currency symbols.
If a field is not found, leave it as an empty string (or 0 for cost).`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Name or title of the purchased asset (e.g. MacBook Pro M3)' },
          category: { type: 'STRING', description: 'Must be one of: Electronics, Furniture, Vehicles, Shared Spaces' },
          acquisitionCost: { type: 'NUMBER', description: 'Total cost or purchase price' },
          serialNumber: { type: 'STRING', description: 'Serial number, service tag, or SKU of the asset if found' },
          acquisitionDate: { type: 'STRING', description: 'Invoice or purchase date in YYYY-MM-DD format' },
          location: { type: 'STRING', description: 'Suggested location or department where the asset should go' },
          supplier: { type: 'STRING', description: 'Vendor or supplier name (e.g., Apple Store, Amazon, Dell)' }
        },
        required: ['name', 'category', 'acquisitionCost', 'serialNumber', 'acquisitionDate']
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMessage = 'Failed to connect to Gemini API.';
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.error?.message || errMessage;
    } catch {
      errMessage = errText || errMessage;
    }
    throw new Error(errMessage);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini API returned an empty response.');
  }

  try {
    return JSON.parse(textContent) as ExtractedAssetData;
  } catch (e) {
    throw new Error('Failed to parse structured JSON from Gemini response.');
  }
}
