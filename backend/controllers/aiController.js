const Groq = require('groq-sdk');

// Initialize Groq client fresh each time
const getGroq = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your-groq-api-key-here') return null;
  return new Groq({ apiKey: key });
};

// Valid categories (must match Transaction model)
const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Housing',
  'Utilities',
  'Education',
  'Travel',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

// @desc    AI-powered expense categorization
// @route   POST /api/ai/categorize
// @access  Private
const categorizeExpense = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const client = getGroq();

    if (!client) {
      console.log('⚠️  No GROQ_API_KEY found, using keyword fallback');
      const category = simpleCategorize(description);
      return res.json({ category, source: 'fallback' });
    }

    const prompt = `You are a financial assistant. Categorize the following transaction description into exactly one of these categories: ${CATEGORIES.join(', ')}.

Transaction description: "${description}"

Respond with ONLY the category name, nothing else. Pick the most appropriate category.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.1,
    });

    const suggestedCategory = response.choices[0].message.content.trim();

    const validCategory = CATEGORIES.find(
      (cat) => cat.toLowerCase() === suggestedCategory.toLowerCase()
    );

    console.log(`✅ Groq categorized "${description}" → ${validCategory || 'Other'}`);

    res.json({
      category: validCategory || 'Other',
      source: 'groq',
    });

  } catch (error) {
    console.error('❌ Groq categorize error:');
    console.error('   Status:', error.status);
    console.error('   Message:', error.message);

    const category = simpleCategorize(req.body.description || '');
    res.json({ category, source: 'fallback' });
  }
};

// @desc    AI-powered monthly spending insights
// @route   POST /api/ai/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const { transactions, month } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        insights: 'No transactions found for this month. Start adding your income and expenses to get personalized insights!',
      });
    }

    const client = getGroq();

    if (!client) {
      const insights = generateBasicInsights(transactions);
      return res.json({ insights, source: 'fallback' });
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const summaryText = `
Month: ${month}
Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpense.toFixed(2)}
Net Balance: ₹${(totalIncome - totalExpense).toFixed(2)}
Category Breakdown: ${Object.entries(categoryBreakdown)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(', ')}
Number of transactions: ${transactions.length}
    `.trim();

    const prompt = `You are a helpful personal finance advisor. Based on the following monthly financial summary, provide 2-3 brief, actionable, and encouraging insights. Be specific, friendly, and practical. Keep your response under 100 words.

Financial Summary:
${summaryText}

Provide insights in plain text (no bullet points, no markdown).`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    console.log('✅ Groq insights generated successfully');

    res.json({
      insights: response.choices[0].message.content.trim(),
      source: 'groq',
    });

  } catch (error) {
    console.error('❌ Groq insights error:');
    console.error('   Status:', error.status);
    console.error('   Message:', error.message);

    const insights = generateBasicInsights(req.body.transactions || []);
    res.json({ insights, source: 'fallback' });
  }
};

// Simple keyword-based categorizer (fallback)
function simpleCategorize(description) {
  const desc = description.toLowerCase();
  if (/restaurant|food|pizza|burger|cafe|coffee|lunch|dinner|breakfast|grocery|supermarket/.test(desc)) return 'Food & Dining';
  if (/uber|taxi|bus|train|metro|fuel|gas|car|petrol|transport/.test(desc)) return 'Transportation';
  if (/amazon|flipkart|shopping|clothes|shirt|shoes|mall/.test(desc)) return 'Shopping';
  if (/netflix|movie|game|spotify|cinema|entertainment/.test(desc)) return 'Entertainment';
  if (/doctor|hospital|medicine|pharmacy|health/.test(desc)) return 'Healthcare';
  if (/rent|house|apartment|mortgage/.test(desc)) return 'Housing';
  if (/electricity|water|wifi|internet|phone|utility/.test(desc)) return 'Utilities';
  if (/school|course|book|tuition|education/.test(desc)) return 'Education';
  if (/hotel|flight|travel|trip|vacation/.test(desc)) return 'Travel';
  if (/salary|paycheck|wage/.test(desc)) return 'Salary';
  if (/freelance|client|project/.test(desc)) return 'Freelance';
  if (/stock|mutual fund|investment|dividend/.test(desc)) return 'Investment';
  return 'Other';
}

// Basic insights generator (fallback)
function generateBasicInsights(transactions) {
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

  if (totalIncome === 0 && totalExpense === 0) {
    return 'No transactions recorded this month. Start tracking your income and expenses to receive insights!';
  }

  if (totalExpense > totalIncome) {
    return `You spent ₹${totalExpense.toFixed(2)} but only earned ₹${totalIncome.toFixed(2)} this month — you are in the red by ₹${(totalExpense - totalIncome).toFixed(2)}. Consider reviewing your discretionary spending to bring your budget back on track.`;
  }

  return `Great job! You saved ₹${(totalIncome - totalExpense).toFixed(2)} this month, which is a ${savingsRate}% savings rate. You had ${transactions.length} transactions in total. Keep tracking your expenses to maintain healthy financial habits!`;
}

module.exports = { categorizeExpense, getInsights };
