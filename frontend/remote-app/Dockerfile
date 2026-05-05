FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY public ./public
COPY src ./src
COPY webpack.config.js ./

EXPOSE 3001

CMD ["npm", "run", "dev"]
