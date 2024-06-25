#!/bin/bash

echo Extra Info running truncate script

psql "user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD} host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME}" -c "TRUNCATE ${LTFRI_DB_SCHEMA}.extra_info_bv_bng RESTART IDENTITY;" -X --echo-queries --set ON_ERROR_STOP=on -w 

echo Extra Info finished running truncate script

exit 0
