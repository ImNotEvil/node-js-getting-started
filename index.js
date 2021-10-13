const sqlite3 = require('sqlite3').verbose();
const fs = require('fs')
var express = require("express");
var app = express();



// open database in memory
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.serialize(function() {

    //Calendrier
    db.run("CREATE TABLE CALENDAR_DATES(service_id TEXT, date DATE, exception_type INT)");
    var stmt1 = db.prepare("INSERT INTO CALENDAR_DATES(service_id,date,exception_type) VALUES (?,?,?)");
    try {
        var data = fs.readFileSync('irigo_gtfs/calendar_dates.txt', 'utf8');
        data = data.split('\r\n');
        data.shift();
        data.pop();

        data.forEach( (item,i) => {
            var ligne = item.split(',')
            stmt1.run(ligne[0] ,ligne[1],ligne[2])
        }
        );
    } catch (err) {
        console.error(err)
    }
    stmt1.finalize();

    //Trips
    db.run("CREATE TABLE TRIPS(route_id TEXT,service_id TEXT,trip_id TEXT,trip_headsign TEXT,direction_id INT,block_id TINT,shape_id TEXT,wheelchair_accessible INT)");
    var stmt2 = db.prepare("INSERT INTO TRIPS(route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id,wheelchair_accessible) VALUES (?,?,?,?,?,?,?,?)");
    try {
        var data = fs.readFileSync('irigo_gtfs/trips.txt', 'utf8');
        data = data.split('\r\n');
        data.shift();
        data.pop();

        data.forEach( (item,i) => {
            var ligne = item.split(',')
            stmt2.run(ligne[0].toUpperCase(),ligne[1],ligne[2],ligne[3].replace(/"/g,""),ligne[4],ligne[5],ligne[6],ligne[7])
        }
        );
    } catch (err) {
        console.error(err)
    }
    stmt2.finalize();

    //Stops
    db.run("CREATE TABLE STOPS(stop_id TEXT,stop_code INT,stop_name TEXT,stop_desc TEXT,stop_lat INT,stop_lon INT,zone_id TEXT,stop_url TEXT,location_type INT,parent_station TEXT,stop_timezone TEXT,wheelchair_boarding INT)");
    var stmt3 = db.prepare("INSERT INTO STOPS(stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,stop_timezone,wheelchair_boarding) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    try {
        var data = fs.readFileSync('irigo_gtfs/stops.txt', 'utf8');
        data = data.split('\r\n');
        data.shift();
        data.pop();

        data.forEach( (item,i) => {
            var ligne = item.split(',')
            stmt3.run(ligne[0],ligne[1],ligne[2].replace(/"/g,""),ligne[3],ligne[4],ligne[5],ligne[6],ligne[7],ligne[8],ligne[9],ligne[10],ligne[11])
        }
        );
    } catch (err) {
        console.error(err)
    }
    stmt3.finalize();

    //Routes
    db.run("CREATE TABLE ROUTES(route_id TEXT,route_short_name TEXT,route_long_name TEXT,route_desc TEXT,route_type INT,route_url TEXT,route_color TEXT,route_text_color TEXT)");
    var stmt4 = db.prepare("INSERT INTO ROUTES(route_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color) VALUES (?,?,?,?,?,?,?,?)");
    try {
        var data = fs.readFileSync('irigo_gtfs/routes.txt', 'utf8');
        data = data.split('\r\n');
        data.shift();
        data.pop();

        data.forEach( (item,i) => {
            var ligne = item.split(',')
            stmt4.run(ligne[0].toUpperCase(),ligne[1].toUpperCase(),ligne[2].replace(/"/g,""),ligne[3],ligne[4],ligne[5],ligne[6],ligne[7])
        }
        );
    } catch (err) {
        console.error(err)
    }
    stmt4.finalize();

    //Stop_times
    db.run("CREATE TABLE STOP_TIMES(trip_id INT,arrival_time DATE,departure_time DATE,stop_id TEXT,stop_sequence INT,pickup_type INT,drop_off_type INT)");
    var stmt5 = db.prepare("INSERT INTO STOP_TIMES(trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type) VALUES (?,?,?,?,?,?,?)");
    try {
        var data = fs.readFileSync('irigo_gtfs/stop_times.txt', 'utf8');
        data = data.split('\r\n');
        data.shift();
        data.pop();

        data.forEach( (item,i) => {
            var ligne = item.split(',')
            stmt5.run(ligne[0],ligne[1],ligne[2],ligne[3],ligne[4],ligne[5],ligne[6])
        }
        );
    } catch (err) {
        console.error(err)
    }
    stmt5.finalize();


});

function route_et_destination(){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        ROUTES.route_short_name,
                        ROUTES.route_long_name,
                        ROUTES.route_color,
                        ROUTES.route_text_color,
                        group_concat(TRIPS.trip_headsigns,'|') as 'trip_headsigns'
                FROM ROUTES
                    INNER JOIN (
                                SELECT DISTINCT
                                    route_id,
									json_array(TRIPS.direction_id,group_concat(DISTINCT trip_headsign)) as 'trip_headsigns',
									direction_id
                                FROM TRIPS
								GROUP BY route_id,TRIPS.direction_id
                                ) AS TRIPS
                    ON TRIPS.route_id = ROUTES.route_id
                GROUP BY ROUTES.route_short_name,ROUTES.route_long_name
                LIMIT 100;
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })
}

function recherche_ligne_par_ligne_direction(champ){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        ROUTES.route_short_name,
                        ROUTES.route_long_name,
                        ROUTES.route_color,
                        ROUTES.route_text_color,
                        group_concat(TRIPS.trip_headsigns,'|') as 'trip_headsigns'
                FROM ROUTES
                    INNER JOIN (
                                SELECT DISTINCT
                                    route_id,
									json_array(TRIPS.direction_id,group_concat(DISTINCT trip_headsign)) as 'trip_headsigns',
									direction_id
                                FROM TRIPS
								GROUP BY route_id,TRIPS.direction_id
                                ) AS TRIPS
                    ON TRIPS.route_id = ROUTES.route_id
                GROUP BY ROUTES.route_short_name,ROUTES.route_long_name
				HAVING
					ROUTES.route_short_name LIKE '%${champ}%'
					OR
					ROUTES.route_long_name LIKE '%${champ}%'
					OR
					group_concat(TRIPS.trip_headsigns,'|') LIKE '%${champ}%'
                LIMIT 100;
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })

}

function tout_les_arrets(){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        STOPS.stop_name,
                        group_concat(DISTINCT TRIPS.route_id) as 'lignes'
                FROM STOPS
                    INNER JOIN STOP_TIMES
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN TRIPS
                        ON TRIPS.trip_id = STOP_TIMES.trip_id

                GROUP BY STOPS.stop_name
                ORDER BY STOPS.stop_name
                LIMIT 100;
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        );
    })
}

function recherche_arret_par_ligne_arret(champ){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        STOPS.stop_name,
                        group_concat(DISTINCT TRIPS.route_id) as 'lignes'
                FROM STOPS
                    INNER JOIN STOP_TIMES
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN TRIPS
                        ON TRIPS.trip_id = STOP_TIMES.trip_id
                WHERE
                    STOPS.stop_name LIKE '%${champ}%'
                    OR
                    TRIPS.route_id LIKE '%${champ}%'
                GROUP BY STOPS.stop_name


                ORDER BY STOPS.stop_name
                LIMIT 100;
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })

}

function recherche_arret(ligne,direction){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        STOPS.stop_name
                FROM STOPS
                    INNER JOIN STOP_TIMES
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN TRIPS
                        ON TRIPS.trip_id = STOP_TIMES.trip_id
                        AND TRIPS.route_id LIKE '${ligne}'
                        AND TRIPS.direction_id LIKE '${direction}'

                ORDER BY STOP_TIMES.stop_sequence,STOPS.stop_name
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })
}
function recherche_arret_par_ligne_direction(ligne,direction,nom){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        STOPS.stop_name
                FROM STOPS
                    INNER JOIN STOP_TIMES
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN TRIPS
                        ON TRIPS.trip_id = STOP_TIMES.trip_id
                        AND TRIPS.route_id LIKE '${ligne}'
                        AND TRIPS.direction_id LIKE '${direction}'
						AND STOPS.stop_name LIKE '%${nom}%'

                ORDER BY STOP_TIMES.stop_sequence,STOPS.stop_name
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })
}
function recherche_direction(ligne,arret){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        group_concat(DISTINCT TRIPS.trip_headsign) as 'directions',
						TRIPS.direction_id
                FROM STOPS
                    INNER JOIN STOP_TIMES
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN TRIPS
                        ON TRIPS.trip_id = STOP_TIMES.trip_id
                        AND TRIPS.route_id LIKE '${ligne}'
                WHERE STOPS.stop_name = '${arret}'
				GROUP BY STOPS.stop_name,TRIPS.direction_id
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })
}

function terminus(ligne,direction){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
						TRIPS.trip_headsign as 'trip_headsign'
                FROM TRIPS
                WHERE TRIPS.route_id = '${ligne}'
				AND   TRIPS.direction_id = ${direction}
                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })
}


function recherche_horraire(ligne,direction,arret){
    return new Promise(resolve => {
        db.all(`SELECT DISTINCT
                        max(STOP_TIMES.arrival_time) as 'Horraire',
                        ROUTES.route_color,
                        ROUTES.route_text_color,
						TRIPS.trip_headsign,
						STOPS.stop_lat,
						STOPS.stop_lon
                FROM CALENDAR_DATES
                    INNER JOIN TRIPS
                        ON TRIPS.service_id = CALENDAR_DATES.service_id
                            AND CALENDAR_DATES.date = strftime('%Y%m%d')
                    INNER JOIN STOP_TIMES
                        ON TRIPS.trip_id = STOP_TIMES.trip_id
                    INNER JOIN STOPS
                        ON STOP_TIMES.stop_id = STOPS.stop_id
                    INNER JOIN ROUTES
                        ON ROUTES.route_id = TRIPS.route_id
                WHERE
                    TRIPS.route_id LIKE '${ligne}'
                AND TRIPS.direction_id LIKE '${direction}'
                AND STOPS.stop_name LIKE '${arret}'

                GROUP BY TRIPS.trip_id,ROUTES.route_color,ROUTES.route_text_color
                ORDER BY max(STOP_TIMES.arrival_time)

                `
                ,function(err, tableau) {
                    resolve(tableau)
                }
        )    ;
    })

}

app.use('/', express.static(__dirname + '/client/'));




app.post(`/update`, (req, res) => {
    console.log("/update");
    var query = req.query;
    console.log(query);
    res.send("reponse");
})


app.get(`/horraire`, (req, res) => {
    res.sendFile(__dirname +'/client/recherche_horraire.html');
})

app.post(`/recherche_horraire`, (req, res) => {
    async function a(){
        console.log("/recherche_horraire");
        var tab = await recherche_horraire(req.query.ligne,req.query.direction,req.query.arret)
        //console.log(tab,req.query.ligne,req.query.direction,req.query.arret)
        res.send(tab)
    }
    a()
})

app.get(`/recherche_arret`, (req, res) => {
    res.sendFile(__dirname +'/client/recherche_arret.html');
})

app.post(`/recherche_arret`, (req, res) => {
    async function a(){
        console.log("/recherche_arret");
        var tab = await recherche_arret(req.query.ligne,req.query.direction)
        //console.log(tab,req.query.ligne,req.query.direction)
        res.send(tab)
    }
    a()
})
app.post(`/recherche_arret_par_ligne_direction`, (req, res) => {
    async function a(){
        console.log("/recherche_arret_par_ligne_direction");
        var tab = await recherche_arret_par_ligne_direction(req.query.ligne,req.query.direction,req.query.arret)
        //console.log(tab,req.query.ligne,req.query.direction)
        res.send(tab)
    }
    a()
})

app.get(`/recherche_direction`, (req, res) => {
    res.sendFile(__dirname +'/client/recherche_direction.html');
})

app.post(`/recherche_direction`, (req, res) => {
    async function a(){
        console.log("/recherche_direction");
        var tab = await recherche_direction(req.query.ligne,req.query.arret)
        //console.log(tab,req.query.ligne,req.query.direction)
        res.send(tab)
    }
    a()
})


app.post(`/recherche_arret_par_ligne_arret`, (req, res) => {
    async function a(){
        console.log("/recherche_arret_par_ligne_arret");
        var tab = await recherche_arret_par_ligne_arret(req.query.champ)
        res.send(tab)
    }
    a()
})
app.post(`/recherche_ligne_par_ligne_direction`, (req, res) => {
    async function a(){
        console.log("/recherche_ligne_par_ligne_direction");
        var tab = await recherche_ligne_par_ligne_direction(req.query.champ)
        res.send(tab)
    }
    a()
})

app.post(`/route_et_destination`, (req, res) => {
    async function a(){
        console.log("/route_et_destination");
        var tab = await route_et_destination()
        res.send(tab)
    }
    a()
})
app.post(`/tout_les_arrets`, (req, res) => {
    async function a(){
        console.log("/tout_les_arrets");
        var tab = await tout_les_arrets()
        res.send(tab)
    }
    a()
})
app.post(`/terminus`, (req, res) => {
    async function a(){
        console.log("/terminus");
        var tab = await terminus(req.query.ligne,req.query.direction)
        res.send(tab)
    }
    a()
})

app.listen(8080, () => {
    console.log("HTTP Server started on port 8080");
})
