# Docker Dev Readme

Die Docker Entwicklungsumgebung dient dazu mit einem Kommando eine voll lauffähige Smartcity-Instanz starten zu können.

## Aktuelle Probleme: 
- Quantum-Leap muss noch von extern zur verfügung gestellt werden
- `qlService` und `frontendService` können sich nicht wie üblich einen Port teilen, weswegen die `PORT`-Variable in der `.env`-Datei den Wert für den Custom-Port des QL-Services hält. Der Port für den Frontend-Service wird in der `docker-compose.yml` über die `environment`-Option gesetzt, da er sonst den selben Wert aus der `.env` ziehen würde, wie der QL-Service.

## Konfigurations-Hinweise
Um die Docker-Umgebung zu konfigurieren die Datei `.env.example` zu `.env` umgenannt werden. 

Die hier vorgegebenen Werte entsprechen der Konfiguration, die in Docker vorzufinden ist.

Beim Starten richten die Smartcity-Services und das Dashboard komplett selbst ein und sind nach dem Start funktionsfähig.

### Mongo-DB Hinweis
Die Docker-Konfiguration startet die Mongo-DB mit dem Port 27021. Damit sie nicht mit eventuell bereits lokal laufenden Instanz kollidiert. Wenn nötig kann der Port in der `.env`- und der `docker-compose.yml`-Datei angepasst werden.

## Entwickler Login
Der Entwickler-Login ist wie folgt:
```
User: dev-admin
Passwort: 12345678
```
Das zugehörige Secret für Hashes ist in der `.env` gespeichert.

## Hinweis zum initialen MongoDB Setup
Die MongoDB wird zu Beginn über ein Skript befüllt, welches in der `mongo-init.js` zu finden ist.
Leider wahr es nicht möglich zum Zeitpunkt der Ausführung das `ObjectID`-Javascript-Objekt zu laden um bei der Befüllung vernünftige ObjectIDs zu erzeugen. 
Aus dem Grund muss bei den Datensätzen, die zu Beginn angelegt werden, händisch via bspw. MongoDB-Compass der ID-Typ der Objekte von `String` auf `ObjectID` geändert werden.
Zudem muss der Datentyp der ID im Array `roles` des Nutzers `dev-admin` geändert werden. Andernfalls können Requests, die mit diesem Nutzer gemacht werden nicht vernünftig authentifiziert werden.