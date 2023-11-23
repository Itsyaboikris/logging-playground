FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]