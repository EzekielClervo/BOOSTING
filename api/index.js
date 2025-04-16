// api/index.js
module.exports = async (req, res) => {
  try {
    // Example: return a simple JSON response or your API logic
    res.status(200).json({ message: 'Hello from Vercel Serverless Function' });
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ error: error.message });
  }
};
