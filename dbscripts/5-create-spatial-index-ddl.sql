\echo 'Extra Info - Create Spatial Index'

CREATE INDEX extra_info_bv_bng_wkb_geometry_geom_idx
  ON extra_info_bv_bng
  USING gist
  (wkb_geometry)
TABLESPACE postgis_indexes;
