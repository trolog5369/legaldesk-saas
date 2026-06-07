const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-5';

/**
 * Analyze a legal document and return structured analysis as a parsed JSON object.
 * @param {string} extractedText - The raw text content of the legal document.
 * @returns {Promise<Object>} Parsed analysis object with summary, riskFlags, keyParties, keyDates, obligations.
 */
const analyzeDocument = async (extractedText) => {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are an expert Indian legal document analyst. Analyze the provided legal document and return your response as strict JSON only. Do not include any prose, markdown fences, preamble, or explanation — output only valid JSON. The JSON object must contain exactly these top-level keys:
- "summary" (string): A concise summary of the document.
- "riskFlags" (array of objects): Each object must have "clause" (string), "risk" (string), and "severity" (string, one of "high", "medium", or "low").
- "keyParties" (array of strings): Names of all key parties involved.
- "keyDates" (array of objects): Each object must have "date" (string) and "description" (string).
- "obligations" (array of strings): Key obligations identified in the document.`,
      messages: [
        {
          role: 'user',
          content: `Analyze the following legal document and return the structured analysis as JSON:\n\n${extractedText}`,
        },
      ],
    });

    const parsed = JSON.parse(response.content[0].text);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON. The model returned invalid JSON output.');
    }
    throw new Error(`Claude API error during document analysis: ${error.message}`);
  }
};

/**
 * Chat with context about a legal document's analysis.
 * @param {Array<{role: string, content: string}>} chatHistory - Previous chat messages.
 * @param {string} newUserMessage - The new message from the user.
 * @returns {Promise<string>} The assistant's response text.
 */
const chatWithDocument = async (chatHistory, newUserMessage) => {
  try {
    const messages = [
      ...chatHistory.map((entry) => ({ role: entry.role, content: entry.content })),
      { role: 'user', content: newUserMessage },
    ];

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: 'You are an expert Indian legal assistant. You have full context of the current case and its document analysis. Answer the user\'s questions about the legal documents, their implications, risks, obligations, and any other legal matters related to this case. Be precise, cite relevant clauses when possible, and provide actionable legal insights.',
      messages,
    });

    return response.content[0].text;
  } catch (error) {
    throw new Error(`Claude API error during chat: ${error.message}`);
  }
};

module.exports = { analyzeDocument, chatWithDocument };
