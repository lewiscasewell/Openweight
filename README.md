<!-- Run docker postgres -->

docker run --name postgres-weight-tracker -d -p 2022:5432 -e POSTGRES_PASSWORD=postgres postgres

<!-- Connect to postgres -->

psql -h localhost -d postgres -p 2022 -U postgres
