#!/bin/bash
​
echo Loading Extra Info layer
​
# ogr2ogr -a_srs "EPSG:27700" -f "PostgreSQL" PG:"host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME} user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD}" ../shp.zip -nln ${LTFRI_DB_SCHEMA}.extra_info_bv_bng -append -select "shape" -progress -nlt MULTIPOLYGON

echo 'Loading Shapefile into the DB'
echo $GEOSPATIALFILE

# ogr2ogr -a_srs "EPSG:27700" -f "PostgreSQL" PG:"host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME} user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD}" "${SHAPEFILE}" -nln ${LTFRI_DB_SCHEMA}.extra_info_bv_bng -append -progress -nlt MULTIPOLYGON
# ogr2ogr -update -append -progress -fieldmap -1,3,4,-1,-1,-1,-1,-1,1 -a_srs "EPSG:27700" -nlt MULTIPOLYGON -f "PostgreSQL" PG:"host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME} user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD}" -nln ${LTFRI_DB_SCHEMA}.extra_info_bv_bng "${SHAPEFILE}"
ogr2ogr -update -append -progress -a_srs "EPSG:27700" -nlt MULTIPOLYGON -f "PostgreSQL" PG:"host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME} user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD}" -nln ${LTFRI_DB_SCHEMA}.extra_info_bv_bng "${GEOSPATIALFILE}"
# ogr2ogr -f "PostgreSQL" PG:"host=${LTFRI_DB_HOST} port=${LTFRI_DB_PORT} dbname=${LTFRI_DB_NAME} user=${LTFRI_DB_USER} password=${LTFRI_DB_PASSWORD}" ${GEOSPATIALFILE} -nln ${LTFRI_DB_SCHEMA}.extra_info_bv_bng -append -progress -nlt MULTIPOLYGON

echo Finished loading Extra Info
​
exit 0

