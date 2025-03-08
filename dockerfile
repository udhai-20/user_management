# Node.js base image
FROM node:18

#  working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --only=production

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
