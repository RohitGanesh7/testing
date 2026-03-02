# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# copy source
COPY . ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
