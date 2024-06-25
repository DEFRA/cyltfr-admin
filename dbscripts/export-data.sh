#!/bin/bash

echo Exporting extra_info

pg_dump "user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD} host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME}" -a --column-inserts -t ${LTFRI_DB_SCHEMA}.extra_info_bv_bng > ${LTFRI_GDB_ROOT}extra_info.sql

echo Finished exporting extra_info
