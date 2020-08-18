-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE power_plants (
    id int NOT NULL PRIMARY KEY,
    country varchar NOT NULL,
    country_long varchar NOT NULL,
    name varchar NOT NULL,
    gppd_idnr varchar NOT NULL,
    capacity_mw NUMERIC NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    primary_fuel varchar NOT NULL,
    commissioning_year varchar NOT NULL,
    owner varchar NOT NULL,
    source varchar NOT NULL,
    url varchar NOT NULL,
    geolocation_source varchar NOT NULL,
    wepp_id varchar NOT NULL,
    year_of_capacity_data varchar NOT NULL,
    generation_gwh_2017 NUMERIC NOT NULL,
    state varchar NOT NULL
);

