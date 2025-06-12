# Use a Node.js base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Set build arguments for api_URL and iframe_URL
ARG api_URL
ARG iframe_URL

# Set environment variables for api_URL and iframe_URL
ENV REACT_APP_API_URL=$api_URL
ENV REACT_APP_IFRAME_URL=$iframe_URL

# Copy package.json and yarn.lock to the container
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code to the container
COPY . .

# Build the React application for production
RUN yarn build

# Expose port 9000
EXPOSE 9000

# Set the command to run when the container starts
CMD ["npx", "serve", "-s", "build", "-l", "9000"]
