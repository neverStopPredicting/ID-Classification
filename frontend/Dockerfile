# Frontend/Dockerfile
FROM node:latest

WORKDIR /usr/src/app

COPY frontend/ .

RUN npm install

EXPOSE 3000
 
CMD ["npm", "start"]
