# Use the official Node.js 20 Alpine image
FROM public.ecr.aws/docker/library/node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only for smaller image size, or full install if needed)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
