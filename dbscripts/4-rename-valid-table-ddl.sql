\echo 'Extra Info - Renaming _valid table original table'

ALTER TABLE u_ltfri.extra_info_bv_bng_valid RENAME TO extra_info_bv_bng;

ALTER SEQUENCE extra_info_bv_bng_valid_ogc_fid_seq RENAME TO extra_info_bv_bng_ogc_fid_seq;
