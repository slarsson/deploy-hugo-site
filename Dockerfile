FROM ubuntu:20.04

ENV SECRET '021f815542e68049c1d7b2c2fdb3e52c'
ENV GIT_USERNAME 'slarsson'
ENV GIT_PASSWORD ''
ENV DOMAIN 'localhost'

RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get install -y git && \
    apt-get install -y python3 && \
    apt-get install wget

COPY nginx.conf /etc/nginx
RUN sed -i s/MY_SECRET_PATH/$SECRET/g /etc/nginx/nginx.conf
RUN sed -i s/MY_DOMAIN/$DOMAIN/g /etc/nginx/nginx.conf
RUN cat /etc/nginx/nginx.conf

COPY deploy.py .
COPY settings.json .

RUN chmod 777 /home

RUN wget https://github.com/gohugoio/hugo/releases/download/v0.63.2/hugo_0.63.2_Linux-64bit.deb && \
    dpkg -i hugo_0.63.2_Linux-64bit.deb
#COPY hugo_0.63.2_Linux-64bit.deb .
#RUN dpkg -i hugo_0.63.2_Linux-64bit.deb

# RUN openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=US/CN=Example-Root-CA"
# RUN openssl x509 -outform pem -in RootCA.pem -out RootCA.crt

RUN mkdir /home/www
RUN mkdir /home/certbot

CMD ["/bin/bash", "-c", "nginx && python3 deploy.py"]