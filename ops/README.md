# Operations for Foody

> Over time these operations should move into a justfile

## Hosting

Currently hosted on [fly.io](https://fly.io) both for compute and for DB storage.

Login on the CLI with 

```
flyctl auth login
```

## Database

Backup the database by setting up the proxy to fly:

```
fly proxy 5555:5432 -a foody-db
```
The first port is the local one, and deliberately not `5432` to not clash with other locally running Postgres instances.
`foody-db` is the name of the fly app.

To actually pull the database, run:

```
pg_dump \
    --username=foody \
    --password \
    --host=localhost \
    --port=5555 \
    --dbname=foody \
    --file foody-db-fly.backup.sql
```
