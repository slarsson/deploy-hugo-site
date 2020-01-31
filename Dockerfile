FROM ubuntu:latest

ENV GIT_USERNAME ''
ENV GIT_PASSWORD ''
ENV HUGO_BASE_URL '/'

RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get install -y git && \
    apt-get install -y nodejs && \
    apt-get install -y npm && \
    apt-get install wget && \
    npm install -g pm2

COPY deploy.js ./home/setup/
COPY package.json ./home/setup/

RUN wget https://github.com/gohugoio/hugo/releases/download/v0.63.2/hugo_0.63.2_Linux-64bit.deb && \
    dpkg -i hugo_0.63.2_Linux-64bit.deb
#RUN wget https://github.com/gohugoio/hugo/releases/download/v0.61.0/hugo_0.61.0_Linux-64bit.deb && \
#    dpkg -i hugo_0.61.0_Linux-64bit.deb

WORKDIR /home/setup
RUN npm install

CMD ["/bin/bash", "-c", "nginx && pm2-runtime start deploy.js"]