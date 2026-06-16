# Smart City Suite — Service-Übersicht

## Legende

- **Container-Port**: Der Port, auf dem der Prozess im Pod lauscht
- **Service-Port**: Der Port im Kubernetes-Cluster (intern immer 80, über ClusterIP)
- **Extern**: Erreichbar von außen über den NGINX Ingress Controller
- **Intern**: Nur innerhalb des Clusters erreichbar

---

## Eigene Microservices

Das URL-Schema folgt dem Muster `https://<service-name>.<ihre-domain>`.
Die Domain wird in der `values-<umgebung>.yaml` unter `hosting.domainName` konfiguriert.

| Service | Container-Port | Zugang | Standard-URL | Beschreibung |
|---|---|---|---|---|
| **frontend** | 3000 | **Extern** | `https://<ihre-domain>` | Next.js UI — einziger direkter Einstiegspunkt für Browser (kein Subdomain-Präfix) |
| **dashboard-service** | 8081 | **Extern** | `https://dashboard-service.<ihre-domain>` | Core-API für Dashboards, Widgets, Mandanten |
| **ngsi-service** | 8082 | **Extern** | `https://ngsi-service.<ihre-domain>` | FIWARE NGSI-LD Datenabruf |
| **orchideo-connect-service** | 8083 | **Extern** | `https://orchideo-connect-service.<ihre-domain>` | Orchideo Integration |
| **infopin-service** | 8084 | **Extern** | `https://infopin-service.<ihre-domain>` | Kartenannotationen (Infopins) |
| **mail-service** | 8085 | **Extern** ¹ | `https://mail-service.<ihre-domain>` | E-Mail Versand |
| **report-service** | 8086 | **Extern** | `https://report-service.<ihre-domain>` | Report-Generierung |
| **static-data-service** | 8087 | **Extern** | `https://static-data-service.<ihre-domain>` | Statische Datensätze |
| **usi-platform-service** | 8088 | **Extern** | `https://usi-platform-service.<ihre-domain>` | USI Platform Integration |
| **internal-data-service** | 8089 | **Extern** | `https://internal-data-service.<ihre-domain>` | Intern gespeicherte Datensätze |
| **project-data-service** | 8090 | **Extern** | `https://project-data-service.<ihre-domain>` | Verkehrsprojekte-Daten |
| **sql-view-service** | 8091 | **Extern** | `https://sql-view-service.<ihre-domain>` | SQL-View Abfragen |
| **data-translation-service** | — | **Nur intern** | — | Background-Worker, kein HTTP-Endpunkt |

> ¹ Hat einen Ingress, wird aber nur von anderen Services aufgerufen — kein direkter Frontend-Zugriff. Wird für Alerting bei Wertüberschreitung genutzt.


---

## Infrastruktur-Services (via Bitnami Helm-Charts)

| Service | Port | Zugang | Standard-URL | Beschreibung |
|---|---|---|---|---|
| **PostgreSQL** | 5432 | **Nur intern** | — | Datenbank, von allen Services genutzt |
| **Keycloak** | 8080 | **Extern** | `https://keycloak.<ihre-domain>` | SSO/OIDC — muss extern erreichbar sein, da der Browser zum Login umgeleitet wird |

---

## Sonderfälle

| Service | Typ | Beschreibung |
|---|---|---|
| **migrations** | Kubernetes Job | Läuft einmalig beim Deployment, führt DB-Migrationen durch |

---

## Erreichbarkeits-Check: URLs mit 200-Response

Zum schnellen Prüfen ob ein Service läuft, können folgende URLs per Browser oder `curl` aufgerufen werden.
Alle aufgelisteten Endpunkte sind ohne Token erreichbar (`@Public` oder kein Auth-Guard).

| Service | Check-URL | Anmerkung |
|---|---|---|
| **frontend** | `https://<ihre-domain>/` | Next.js Login- oder Dashboard-Seite |
| **dashboard-service** | `https://dashboard-service.<ihre-domain>/tenants` | Gibt Liste aller Mandanten zurück |
| **ngsi-service** | — | Alle Routen benötigen Pfad-Parameter; eine `404`-Antwort zeigt bereits, dass der Service läuft |
| **orchideo-connect-service** | `https://orchideo-connect-service.<ihre-domain>/wizard/collections` | Gibt Liste zurück (ggf. leer) |
| **infopin-service** | `https://infopin-service.<ihre-domain>/climate-projects` | Gibt Liste zurück (ggf. leer) |
| **mail-service** | — | Nur POST-Routen vorhanden; eine `404`-Antwort zeigt, dass der Service läuft |
| **report-service** | `https://report-service.<ihre-domain>/configs` | Gibt Liste zurück (ggf. leer) |
| **static-data-service** | — | Kein Controller registriert, nur Background-Worker; eine `404`-Antwort zeigt, dass der Service läuft |
| **usi-platform-service** | `https://usi-platform-service.<ihre-domain>/usi-platform/event-types` | `apiId` ist optionaler Query-Parameter |
| **internal-data-service** | `https://internal-data-service.<ihre-domain>/data` | Gibt Liste zurück (ggf. leer) |
| **project-data-service** | `https://project-data-service.<ihre-domain>/project` | Gibt Liste zurück (ggf. leer) |
| **sql-view-service** | `https://sql-view-service.<ihre-domain>/wizard/collections` | Gibt Liste zurück (ggf. leer) |
| **data-translation-service** | — | Kein HTTP-Server, reiner Background-Worker — nicht per HTTP prüfbar |

> **Hinweis:** Für `ngsi-service`, `mail-service` und `static-data-service` gilt: eine HTTP-`404`-Antwort
> bedeutet bereits, dass der Service **erreichbar und gestartet** ist. Nur `data-translation-service`
> hat bewusst keinen HTTP-Server (`service.enabled: false` in der Helm-Config).

---

