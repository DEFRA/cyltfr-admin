\echo 'Extra Info - MakeValid'

CREATE TABLE u_ltfri.extra_info_bv_bng_valid TABLESPACE postgis_tables AS WITH
	make_valid (id,info,apply,"start","end",shape_length,shape_area,wkb_geometry) AS
	(SELECT id,info,apply,"start","end",shape_length,shape_area,
		(ST_Dump(ST_MakeValid(wkb_geometry))).geom AS wkb_geometry FROM u_ltfri.extra_info_bv_bng
	)            
SELECT * FROM make_valid WHERE ST_GeometryType(wkb_geometry) IN('ST_Polygon','ST_MultiPolygon');

ALTER TABLE u_ltfri.extra_info_bv_bng_valid ALTER COLUMN wkb_geometry TYPE geometry(Multipolygon,27700) USING ST_Multi(wkb_geometry);

ALTER TABLE u_ltfri.extra_info_bv_bng_valid  ADD COLUMN riskOverride character varying COLLATE pg_catalog."default";
ALTER TABLE u_ltfri.extra_info_bv_bng_valid ADD COLUMN ogc_fid SERIAL;
UPDATE u_ltfri.extra_info_bv_bng_valid SET ogc_fid = DEFAULT;
ALTER TABLE u_ltfri.extra_info_bv_bng_valid ADD PRIMARY KEY(ogc_fid);
