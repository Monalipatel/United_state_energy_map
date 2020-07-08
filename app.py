import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template

from config import username, password, username_heroku, password_heroku, database_heroku, host_heroku

connection_string = f"{username_heroku}:{password_heroku}@{host_heroku}:5432/{database_heroku}"
engine = create_engine(f'postgresql://{connection_string}')

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

power_plants_data = Base.classes.power_plants
#################################################
# Flask Setup
#################################################
app = Flask(__name__)

@app.route("/")
def welcome():
    
    return render_template('index.html')
        
@app.route("/api/v1.0/testing")
def power_plant_filter():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all Power Plants depending on filter"""
    
    results3 = session.query(power_plants_data.name, power_plants_data.owner, power_plants_data.latitude, power_plants_data.longitude, power_plants_data.capacity_mw, power_plants_data.primary_fuel, power_plants_data.commissioning_year).filter_by(primary_fuel='Gas').all()
    # for row in results3:
    #     print(f'Plant Name: {row.name} ||| Capacity (MW): {row.capacity_mw} ||| Fuel Type: {row.primary_fuel}')

    session.close()


    # Failed Attempt to return all results

    all_rows = []
    for name, owner, latitude, longitude, capacity_mw, primary_fuel, commissioning_year in results3:
        test_dict = {}
        test_dict["name"] = name
        test_dict["owner"] = owner
        test_dict["latitude"] = float(latitude)
        test_dict["longtitude"] = float(longitude)
        test_dict["capacity_mw"] = float(capacity_mw)
        test_dict["primary_fuel"] = primary_fuel
        test_dict["commissioning_year"] = commissioning_year
        all_rows.append(test_dict)
    unique_countries = list(np.ravel(results3))
    print(all_rows)


    return jsonify(all_rows)
    # return render_template("index.html", rows=all_rows)

@app.route("/all_energy")
def return_all_energy():
    session = Session(engine)
    test_filter = session.query(power_plants_data.name, power_plants_data.state, power_plants_data.owner, power_plants_data.latitude, power_plants_data.longitude, power_plants_data.primary_fuel, power_plants_data.commissioning_year, power_plants_data.generation_gwh_2017).all()
    
    session.close()

    all_rows = []
    for name, state, owner, latitude, longitude, primary_fuel, commissioning_year, generation_gwh_2017 in test_filter:
        test_dict = {}
        test_dict["name"] = name
        test_dict["state"] = state
        test_dict["commissioning_year"] = commissioning_year
        test_dict["primary_fuel"] = primary_fuel
        test_dict["latitude"] = float(latitude)
        test_dict["longitude"] = float(longitude)
        test_dict["generation_gwh_2017"] = float(generation_gwh_2017)
        test_dict["owner"] = owner
        
        all_rows.append(test_dict)

    return jsonify(all_rows)

@app.route("/filter_stats_table/<fuel_type>")
def stats_filter(fuel_type):
    session = Session(engine)

    gwh_produced_all = session.query(power_plants_data.generation_gwh_2017).all()
    
    all_gwh_sum = np.sum(gwh_produced_all)

    gwh_produced = session.query(power_plants_data.generation_gwh_2017).filter_by(primary_fuel= fuel_type).all()
   
    avg_gwh = np.mean(gwh_produced)

    session.close()

    number_of_power_plants = len(gwh_produced)

    power_gwh_sum = np.sum(gwh_produced)

    percent_produced = ((power_gwh_sum / all_gwh_sum) * 100)

    return_object = {"num_power_plants":number_of_power_plants,"total_prod":float(power_gwh_sum), "avg_prod":float(avg_gwh), "percent_prod":float(percent_produced)}

    return return_object

@app.route("/energy_filter/<fuel_type>")
def filter_function(fuel_type):
    # Create our session (link) from Python to the DB
    session = Session(engine)

    # fuel_type_input = input('Enter Fuel Type: ')
    test_filter = session.query(power_plants_data.name, power_plants_data.owner, power_plants_data.latitude, power_plants_data.longitude, power_plants_data.capacity_mw, power_plants_data.primary_fuel, power_plants_data.commissioning_year, power_plants_data.generation_gwh_2017).filter_by(primary_fuel= fuel_type).all()
    
    
    
    all_rows_2 = []
    for name, owner, latitude, longitude, capacity_mw, primary_fuel, commissioning_year, generation_gwh_2017 in test_filter:
        test_dict = {}
        test_dict["name"] = name
        test_dict["owner"] = owner
        test_dict["latitude"] = float(latitude)
        test_dict["longtitude"] = float(longitude)
        test_dict["capacity_mw"] = float(capacity_mw)
        test_dict["primary_fuel"] = primary_fuel
        test_dict["commissioning_year"] = commissioning_year
        test_dict["generation_gwh_2017"] = float(generation_gwh_2017)
        all_rows_2.append(test_dict)

    print(all_rows_2)

    

    print("---------------------------------------------------")
    print(f'Average GWH Produced from {fuel_type}: {avg_gwh}')
    # unique_countries = list(np.ravel(test_filter))

    
    print("---------------------------------------------------")
    print(f'Total GWH Produced from {fuel_type}: {total_gwh}')    

    session.close()
    # return jsonify(all_rows_2)
    return (
        jsonify(all_rows_2)
        # f'The Average GWH produced by {fuel_type}: {avg_gwh}' '<br/>'
        # f'Total GWH Produced from {fuel_type}: {total_gwh}'
         )

@app.route("/year_filter/<year_input>")
def filter_function2(year_input):

    # Create our session (link) from Python to the DB
    session = Session(engine)


    # year_input is a string
    # year_input = input('Enter Year: ')

    test_filter = session.query(power_plants_data.name, 
        power_plants_data.owner, power_plants_data.latitude, \
        power_plants_data.longitude, power_plants_data.capacity_mw, \
        power_plants_data.primary_fuel, power_plants_data.commissioning_year).\
        filter_by(commissioning_year = year_input).all()
        
    session.close()
    
    all_rows_3 = []
    for name, owner, latitude, longitude, capacity_mw, primary_fuel, commissioning_year in test_filter:
        test_dict = {}
        test_dict["name"] = name
        test_dict["owner"] = owner
        test_dict["latitude"] = float(latitude)
        test_dict["longtitude"] = float(longitude)
        test_dict["capacity_mw"] = float(capacity_mw)
        test_dict["primary_fuel"] = primary_fuel
        test_dict["commissioning_year"] = commissioning_year
        all_rows_3.append(test_dict)
    # unique_countries = list(np.ravel(test_filter))
    print(all_rows_3)

    return jsonify(all_rows_3)


@app.route("/map_filter/<state_name>/<energy>/<year>")
def map_filter(state_name, energy, year):
    
    session = Session(engine)

    if energy != "All" and state_name != "All" and year != "All":
        data = session.query(power_plants_data.name, 
            power_plants_data.latitude, power_plants_data.longitude, 
            power_plants_data.primary_fuel, power_plants_data.commissioning_year,
            power_plants_data.state).\
            filter(power_plants_data.primary_fuel == energy).\
            filter(power_plants_data.state == state_name).\
            filter(power_plants_data.commissioning_year == year).all()

    ################
    if energy == "All":
        data = session.query(power_plants_data.name, 
            power_plants_data.latitude, power_plants_data.longitude, 
            power_plants_data.primary_fuel, power_plants_data.commissioning_year,
            power_plants_data.state).\
            filter(power_plants_data.state == state_name).\
            filter(power_plants_data.commissioning_year == year).all()

    if state_name == "All":
        data = session.query(power_plants_data.name, 
            power_plants_data.latitude, power_plants_data.longitude, 
            power_plants_data.primary_fuel, power_plants_data.commissioning_year,
            power_plants_data.state).\
            filter(power_plants_data.primary_fuel == energy).\
            filter(power_plants_data.commissioning_year == year).all()
    
    if year == "All":
        data = session.query(power_plants_data.name, 
            power_plants_data.latitude, power_plants_data.longitude, 
            power_plants_data.primary_fuel, power_plants_data.commissioning_year,
            power_plants_data.state).\
            filter(power_plants_data.state == state_name).\
            filter(power_plants_data.primary_fuel == energy)
            

    ################
    if energy == "All":
        if state_name == "All":
            data = session.query(power_plants_data.name, 
                power_plants_data.latitude, power_plants_data.longitude, 
                power_plants_data.primary_fuel, power_plants_data.commissioning_year,
                power_plants_data.state).\
                filter(power_plants_data.commissioning_year == year).all()

    if state_name == "All":
        if year == "All":
            data = session.query(power_plants_data.name, 
                power_plants_data.latitude, power_plants_data.longitude, 
                power_plants_data.primary_fuel, power_plants_data.commissioning_year,
                power_plants_data.state).\
                filter(power_plants_data.primary_fuel == energy).all()
    
    if year == "All":
        if energy == "All":
            data = session.query(power_plants_data.name, 
                power_plants_data.latitude, power_plants_data.longitude, 
                power_plants_data.primary_fuel, power_plants_data.commissioning_year,
                power_plants_data.state).\
                filter(power_plants_data.state == state_name).all()

    session.close()

    all_rows = []

    for name, latitude, longitude, primary_fuel, commissioning_year, state in data:
        test_dict = {}
        test_dict["name"] = name
        test_dict["latitude"] = float(latitude)
        test_dict["longitude"] = float(longitude)
        test_dict["primary_fuel"] = primary_fuel
        test_dict["commissioning_year"] = commissioning_year
        test_dict["state"] = state
        all_rows.append(test_dict)

    return jsonify(all_rows)


# @app.route("/state_filter/<state>")
# def state_filter(state):
#     # Create our session (link) from Python to the DB
#     session = Session(engine)

#     # state_input = input('Enter State: ')
#     test_filter = session.query(power_plants_data.name, power_plants_data.state, power_plants_data.latitude, power_plants_data.longitude, power_plants_data.primary_fuel, power_plants_data.commissioning_year, power_plants_data.generation_gwh_2017).filter_by(state= state).all()
    
#     session.close()
    
#     all_rows_3 = []
#     for name, state, latitude, longitude, primary_fuel, commissioning_year, generation_gwh_2017 in test_filter:
#         test_dict = {}
#         test_dict["name"] = name
#         test_dict["state"] = state
#         test_dict["latitude"] = float(latitude)
#         test_dict["longtitude"] = float(longitude)
#         test_dict["primary_fuel"] = primary_fuel
#         test_dict["commissioning_year"] = commissioning_year
#         test_dict["generation_gwh_2017"] = float(generation_gwh_2017)
#         all_rows_3.append(test_dict)
#     unique_countries = list(np.ravel(test_filter))
#     print(all_rows_3)

#     return jsonify(all_rows_3)

if __name__ == '__main__':
    app.run(debug=True)