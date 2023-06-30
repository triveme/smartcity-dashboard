# Hosting Commands

> Build and run Frontend
 
 `sudo docker build -t smartcity-dashboard/frontend:0.1.0-dev -f frontend/Dockerfile-Prod .`

`sudo docker run --name frontend -p80:80 --network wuppertal-net -d smartcity-dashboard/frontend:0.1.0-dev`

> Build and run MongoDB

`sudo docker build -t smartcity-dashboard/mongodb:0.1.0-dev -f Dockerfile-DB .`
`sudo docker run --name mongodb -p27017:27017 --network wuppertal-net -d smartcity-dashboard/mongodb:0.1.0-dev`

> Build and run Frontend-Service
 
 `sudo docker build -t smartcity-dashboard/frontendservice:0.1.0-dev -f Dockerfile .`

`sudo docker run --name frontendservice -p8080:8080 --network wuppertal-net -e FRONTEND_HOST=https://smartcity.wuppertal.de -e DB_HOST=mongodb -e DB_PORT=27017 -e DB_NAME=smartcity -e DB_USER=smartcity -e DB_PWD=xbox-anger-amiable2 -e SECRET=SmartCity-Dev -d smartcity-dashboard/frontendservice:0.1.0-dev`

> Run QL-Service
 
`sudo docker build -t smartcity-dashboard/qlservice:0.1.0-dev -f Dockerfile .`

`sudo docker run --name qlservice --network wuppertal-net -e DB_HOST=mongodb -e DB_PORT=27017 -e DB_NAME=smartcity -e DB_USER=smartcity -e DB_PWD=xbox-anger-amiable2 -d smartcity-dashboard/qlservice:0.1.0-dev`
