# Use a Node.js base image (Node 22 required by some transitive deps)
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Enable Corepack so Yarn matches the repo lockfile format
RUN corepack enable && corepack prepare yarn@4.17.0 --activate

# Set build arguments for api_URL and iframe_URL
ARG api_URL
ARG iframe_URL

# Set environment variables for api_URL and iframe_URL
ENV REACT_APP_API_URL=$api_URL
ENV REACT_APP_IFRAME_URL=$iframe_URL
ENV HUSKY=0

# Copy package manifests and Yarn config before install for better layer caching
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application code to the container
COPY . .

# Build the React application for production
RUN yarn build

# Expose port 9000
EXPOSE 9000

# Set the command to run when the container starts
CMD ["npx", "serve", "-s", "build", "-l", "9000"]
