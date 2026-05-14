// Legacy script: consultation and academy submissions now use Netlify Forms (see index.html + src/App.jsx).
// Kept so CI or docs that still reference this path get a clear no-op instead of a broken import.

console.log("[smoke-test-functions] Skipped — forms are handled by Netlify Forms, not serverless functions.");
process.exit(0);
