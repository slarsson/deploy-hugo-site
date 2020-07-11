# ENV
```
GIT_PASSWORD=''
GIT_USERNAME=''
HUGO_BASE_URL='/mypath/'

ex:
docker build -t mycontainer .

docker run -p 80:80 -p 3000:3000 -e GIT_USERNAME='' -e GIT_PASSWORD='' 
-e HUGO_BASE_URL='/' -d mycontainer
```