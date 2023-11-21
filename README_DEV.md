# Dev Readme

## Installation

Um alle Abhängigkeiten zu installieren, kann im Root-Verzeichnis des Projekts folgender Befehl ausgeführt werden:

```
npm install
```

## Starten der Entwicklungsumgebung

Zur lokalen Entwicklung:

```
docker-compose up
```

Falls es nötig sein sollte, die Container neu zu bauen:

```
docker-compose build
```

## Docker

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

## Keycloak

Sämtliche Zugangsdaten sind in der `.env`-Datei zu finden.

Zur lokalen Entwicklung is Keycloak bereits vorkonfiguriert und standardmäßig unter http://localhost:28080/ erreichbar. Die Logindaten für die Admin-Konsole lauten:

```
Username: admin
Passwort: admin
```

Zum Testen sollte das Realm `testrealm` verwendet werden. Dieses enthält den öffentlichen Client `dashboard-test-client` und die Rolle `admin`.
Da Registrierungen im Realm aktiviert sind, können über http://localhost:3000/login beim Anmelden mit Keycloak neue Accounts erstellt werden.

Über folgende URL der Admin-Konsole können Nutzer des Realms verwaltet werden, bspw. um die Rolle `admin` zu vergeben: http://localhost:28080/admin/master/console/#/testrealm/users
