FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

COPY *.js /usr/src/app/

COPY public /usr/src/app/public

COPY resources /usr/src/app/resources

EXPOSE 8888

CMD ["node", "line_notify_service.js"]
