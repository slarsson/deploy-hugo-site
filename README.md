

-v /.../data/www:/home/certbot
-v /.../data/letsencrypt:/etc/letsencrypt

-p 80:80
-p 443:443

# RUN openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=US/CN=Example-Root-CA"
# RUN openssl x509 -outform pem -in RootCA.pem -out RootCA.crt

test: 021f815542e68049c1d7b2c2fdb3e52c