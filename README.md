# deploy-hugo-site
Setup for hosting a website built with HUGO using Docker. 

The website updates (pulls from github + builds site) when hitting selected url (ex: example.com/my_secret_path)  

## Docker
```
docker run 
    -p 80:80
    -p 443:443
    -e GIT_USERNAME='??'
    -e GIT_PASSWORD='??'
    -v /data/www:/home/certbot/ # volume used for ./well-known dir
    -v /etc/letsencrypt:/etc/letsencrypt/ # volume used for letsencrypt, /live/example.com/fullchain.pem .. 
    -d my_container
```

## SSL

https://docs.iredmail.org/letsencrypt.html
```
certbot certonly --webroot -w /data/www -d example.com
```

### Self signed SSL-cert:
```
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=US/CN=Example-Root-CA"

openssl x509 -outform pem -in RootCA.pem -out RootCA.crt
```