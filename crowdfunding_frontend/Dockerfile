FROM node:24-alpine3.21

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]

