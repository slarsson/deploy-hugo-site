import subprocess
import socketserver
import uuid
import json
import os

GIT_USERNAME = str(os.getenv("GIT_USERNAME"))
GIT_PASSWORD = str(os.getenv("GIT_PASSWORD"))

class HTTP_Listener(socketserver.StreamRequestHandler):
    def handle(self):
        body = "<pre>"+build()+"</pre>"
        self.wfile.write(("HTTP/1.1 200 OK\nContent-Type: text/html\n\n"+body).encode())

def build():
    try:
        settings = json.load(open(r"/settings.json"))
        print(settings["git"]["branch"])

        temp_path = str(uuid.uuid1())
        hugo_path = settings["git"]["repository"]
        if len(settings["hugo"]["target"]) != 0:
            hugo_path += "/"+settings["hugo"]["target"]

        p = subprocess.run(["mkdir", temp_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/home")
        if p.returncode != 0:
            raise Exception(p.stderr)
        
        p = subprocess.run(["git", "clone", "-b", settings["git"]["branch"], "--single-branch", "https://"+GIT_USERNAME+":"+GIT_PASSWORD+"@github.com/"+settings["git"]["owner"]+"/"+settings["git"]["repository"]+".git"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/home/"+temp_path)
        if p.returncode != 0:
            raise Exception(p.stderr)

        p = subprocess.run(["/usr/local/bin/hugo", *settings["hugo"]["flags"]], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/home/"+temp_path+"/"+hugo_path)
        if p.returncode != 0:
            raise Exception(p.stderr)
        hugo_build_output = p.stdout

        p = subprocess.run(["rm -rf /home/www/*"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/")
        if p.returncode != 0:
            raise Exception(p.stderr)

        p = subprocess.run(["mv public/* /home/www"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/home/"+temp_path+"/"+hugo_path)
        if p.returncode != 0:
            raise Exception(p.stderr)

        p = subprocess.run(["rm", "-rf", temp_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="/home")
        if p.returncode != 0:
            raise Exception(p.stderr)

        # TODO: save/send output + create backup?
        #print("hugo build output:", hugo_build_output)
        return hugo_build_output.decode()

    except Exception as err:
        return str(err)
        print(err)  

if __name__ == '__main__':
    with socketserver.TCPServer(("", 1337), HTTP_Listener) as httpd:
        httpd.serve_forever()