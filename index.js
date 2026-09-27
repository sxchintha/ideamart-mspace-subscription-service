/**
 * Main entry point for the Backend API
 * Loads configuration and starts the Express server
 */
import "dotenv/config";
import app from "./app.js";

// Server configuration
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
