# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port for preview
EXPOSE 4173

# Start the application using vite preview
CMD ["npm", "run", "preview", "--", "--host"]
