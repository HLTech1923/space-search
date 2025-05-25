# Use Node.js 22 as the base image
FROM node:22

# Create a working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire source code into the container
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port 3000 in the container
EXPOSE 3001

# Command to run the application when the container starts
CMD ["npm", "start"]
