FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY App.js ./
COPY bootstrap.js ./
COPY index.html ./
COPY index.js ./
COPY webpack.config.js ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
