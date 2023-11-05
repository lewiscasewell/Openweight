# Openweight

## A weight tracking app for iOS

Built with react-native and nodejs.

## Frontend

The frontend react-native application uses WatermelonDB for local storage. WatermelonDB also offers syncing primitives that allow you to build out a custom sync solution between the client SQL database and your server database.

This application also takes advantage of react-native-mmkv and jotai for storing atomic state, such as the session, notification preferences, and login-flow implementation.

## Backend

Supabase was used for authentication, since it is easy to use, offers flexibility, and is free. Also, it is built on top of Postgres, which is the database used for the server, and has the ability to migrate users onto your own custom solution at a later date.

As mentioned above, Postgres was used for the database, since it is free, open-source, and has a lot of features. It is also easy to use, and has a lot of documentation. The application uses Supabase's Postgres database, but it is possible to migrate to your own Postgres database at a later date.

Fastify was used as a web framework for the server, since it is fast, lightweight, and easy to use. Lots of plugins are available for it, and it is easy to write your own.

## Some useful commands

### Run postgres in docker

```
docker run --name postgres-weight-tracker -d -p 2022:5432 -e POSTGRES_PASSWORD=postgres postgres
```

### Connect to postgres in docker, via terminal

```
psql -h localhost -d postgres -p 2022 -U postgres
```
