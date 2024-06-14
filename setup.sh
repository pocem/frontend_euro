export NODE_OPTIONS=--max_old_space_size=4096

# Navigate to the frontend directory
cd /React


# Install npm dependencies for frontend
npm install

# Install missing peer dependency for frontend (if needed)
npm install @popperjs/core@^2.11.8

# Build the frontend
npm run build

# Serve the frontend files using a simple HTTP server (optional)
# This step is to serve static files directly from Heroku without configuring the backend.
# If you do not want to serve from Heroku, you can skip this step.
npm install -g serve
serve -s build
