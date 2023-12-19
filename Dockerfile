FROM node:latest

RUN mkdir -p /opt/line_notify_service

WORKDIR /opt/line_notify_service

COPY package.json /opt/line_notify_service

RUN npm install

COPY *.js /opt/line_notify_service

COPY public /opt/line_notify_service/public

COPY resources /opt/line_notify_serviceresources

EXPOSE 8888

CMD ["node", "line_notify_service.js"]
