FROM node:24-alpine3.21

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "preview", "--", "--port", "8080", "--host"]
