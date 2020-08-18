# global_energy_map

Global Energy Map is an interactive dashboard meant to inform the user about the power plants in the United States & Canada. By implementing JavaScript, PgAdmin (SQL), Flask, the dashboard was built with the idea of providing the user with a visual of where energy is generated in North America. Not sure where to start? Zoom in to your local area and find out where Energy is generated near you! You can also navigate the Power Plants Statistics table to find out 


Heroku - PgAdmin/Postgres SQL (How to link)

*Create app in Heroku
*Navigating in Heroku, download the “Hobby Dev” add-on.
*Resources -> Add-ons -> Hobby Dev (Free)
*In your “Hobby Dev” add-on, we will copy the host name of the Heroku database
*View Credentials -> Copy Host
*In PGAdmin4 we will go and create a new server
*Inside the new server we will go to “Connection” and input relevant information regarding our Heroku database such as: Host name, Port, etc..
*Go to new PGAdmin Server -> Click on Databases
*You need to find your database name within your new server
*Once you reach your Heroku - PGAdmin Server, you use your query tool to create a table.
*Create Engine
*Add the heroku credentials into your config.py file (in git ignore)
*When importing your dependencies, add all the variables that store your heroku credentials
*Create engine using all the credentials from heroku


Cleaning Data
Our data was imported from https://datasets.wri.org/dataset/globalpowerplantdatabase. The table included data from every power plant in the world with a registered WEPP ID. The UDI World Electric Power Plants Database (WEPP) is a global inventory of electric power generating units. Upon closer inspection of the dataset, it was noticed that the data from Power Plants within the United States looked more complete than the rest. The data for Power Plants abroad had many missing values; our most important data point was the Generation of GW-Hours for 2017 was missing for most power plants outside of the United States. Any values that were N/A were replaced using the “fillna” command in pandas.
Filling in missing Data Points by using Reverse Geocoder library:
Since our table included information from around the world and we chose to focus on data from inside the United States, we had to fill in a missing property: the State of where the power plant is located. To do this we used Reverse Geocoder. By using this library we were able to locate the state of a power plant based on latitude and longitude. We created a loop that will go through each row of our table and query the library based on the coordinates. The response we get from the library includes the State. We stored this value and created a new column in our dataframe. 
Once we have obtained the location (State) of each Power Plant we exported our dataframe into a clean CSV file. This CSV file was then imported to our Postgres/PGAdmin database. This method was preferred instead of exporting our dataframe directly to Postgres. The following paragraph explains why.


Issues with Importing Clean Data to Heroku 
One of the major issues that we encountered in this project was importing our clean data into our Heroku Database. Our table schema was already created inside our Postgres Database; the schema included a primary key which was meant to be our Plant ID. Due to our data cleaning process being run using Pandas, we had to eventually export our data in sql format using the “df.to_sql” command. Everytime we would run this command and export it to our Heroku database, our primary_key column would be overwritten. The effect this had downstream was that it wouldn’t allow our flask application to create or read our classes using the automap_base extension. If our classes aren’t able to be read using sqlalchemy, then we wouldn’t be able to query our database. 
Solution
Our solution to this was to export our clean data into a new CSV file. Our CSV file was then imported into our table within the PgAdmin database. This solved our hurdle of our primary key being overwritten. Since our primary key remained intact, we were able to create a class in sqlalchemy and subsequently query our database. 


Flask - How to
Import our dependencies
SQLAlchemy to reflect our existing tables (from postgres/heroku)
SQLAlchemy to create and end a session of our postgres database
Numpy to perform arithmetic such as mean, sum, or count 
Flask to create our routes, jsonify our objects/dictionaries
Using SQLAlchemy we will create our app routes, create our sessions, and query our database based on the user input
Each app route will have its own function that will handle querying
Functions will be created with one of the column names as the argument; the column name will be used as a filter for the query
In each function: we will create a session, query the session, and consequently close the session
A dictionary will be created to store all the values queried.
Each row of our results will be stored as its own dictionary and subsequently appended into an empty list.
The initially empty list is now appended with every row in the query. We will use the jsonify command to return our list.
Each route will perform its own query. Once our functions are complete and functional, we will reference the app route in our JavaScript file. Our flask app route is handling the queries and serving them to the JavaScript index file.
