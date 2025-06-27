FROM node:24-alpine3.21

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]