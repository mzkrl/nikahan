import app from '../dist/index.cjs';

// In a Vercel serverless function with type: module, importing a CJS file 
// (which esbuild bundled into module.exports or exports.default) 
// might result in the default export being wrapped.
// We export the app directly.
export default app;
