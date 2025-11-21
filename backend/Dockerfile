FROM node:22-alpine

WORKDIR /web-iot-store/backend

COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "production"]