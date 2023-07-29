# Use a Node.js base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies, including TypeScript globally
RUN npm install -g typescript && npm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript files to JavaScript
RUN tsc

# Start the application
CMD ["node", "build/index.js"]
