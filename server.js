const express = require('express');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");

const nodemailer = require('nodemailer');
const router = require('./router');

const app = express();

const port = process.env.PORT || 3000;

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const request = require("request");

var mysql = require('mysql');
const { isStringObject } = require('util/types');
// const { Socket } = require('socket.io');
//const { send } = require("process");

// Set the path to your assets folder
const assetsPath = __dirname + '/Assets';


//Create a connection to the database named sensors, this database is for the sensors and actuators status and readings
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sensors"
});


//Create a connection to a database named login this database is for users credentials
var con1 = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "login"
});

con.connect(function (err) {
    // if (err) throw err;
    // //console.log("Connected!");
    // res.send('Connected to DATABASE');
});
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'hydroponicsystem2023@gmail.com',
        pass: 'dbnpsvffdkcypuwy'
        
    }
});



// Set the route to your images
app.use('/img', express.static(assetsPath + '/img'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

// load static assets
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public/css')));

app.use(session({
    secret: uuidv4(), //  '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    resave: false,
    saveUninitialized: true,

}));


//This is the API endpoint for GET requests of the system's sensors
app.get('/api', function (req, res) {

  res.render('api_endpoint');
// console.log(req.query.water_temp)
  con.query(`INSERT INTO sensorreadings1 (id, Water_Temperature, Ph_Value, Ec_Value) VALUES (?, ?, ?, ?);`,[null,req.query.water_temp,req.query.ph_val,req.query.ec_val], function (err, result, fields) {

      // if (err) throw err;
//console.log("Success");
      //console.log(result[0]['fan_status']);
  });
  con.query(`INSERT INTO sensorreadings2 (id, Humidity, Room_Temp) VALUES (?, ? ,?);`,[null,req.query.humid,req.query.room_temp], function (err, result, fields) {
      if (req.query.room_temp !=null ) {
          con.query("SELECT * FROM `status`", function (err, result, fields) {

            if (req.query.room_temp >= 26 && (result[0]['fan_status'] == "ON")) {

              const url = "http://192.168.1.245/cm?cmnd=Power%20On";
            //  request.get(url, (error, response, body) => {});
            } else {
              const url = "http://192.168.1.245/cm?cmnd=Power%20Off";
             // request.get(url, (error, response, body) => {});
                 
            }
          });
               
      }
      if (req.query.humid !=null) {
          con.query("SELECT * FROM `status`", function (err, result, fields) {

            if (req.query.humid <= 80 && result[0]['mist_status'] == "ON") {
              const url = "http://192.168.1.107/cm?cmnd=Power%20On";
              // request.get(url, (error, response, body) => {});
            } else {
              const url = "http://192.168.1.107/cm?cmnd=Power%20Off";
              // request.get(url, (error, response, body) => {});
            }

          });
          
      }

  });

 



  


  

 // console.log(req);
});

io.sockets.on("connection", socket => {
    

    setInterval(() => {
      con.query("SELECT * FROM `sensorreadings1` ORDER BY `id` DESC", function (err, result, fields) {
        // if (err) throw err;
        io.sockets.emit("water_temp", result[0]['Water_Temperature']);
        io.sockets.emit("ph_value", result[0]['Ph_Value']);
        io.sockets.emit("ec_value", result[0]['Ec_Value']);
  
        ////console.log(result[0]['fan_status']);
      });
  
      con.query("SELECT * FROM `sensorreadings2` ORDER BY `id` DESC", function (err, result, fields) {
        // if (err) throw err;
        io.sockets.emit("humid", result[0]['Humidity']);
        io.sockets.emit("room_temp", result[0]['Room_Temp']);
  
        ////console.log(result[0]['fan_status']);
      });
  
      con.query("SELECT * FROM `status`", function (err, result, fields) {
        // if (err) throw err;
        io.sockets.emit("fan_status", result[0]['fan_status']);
        io.sockets.emit("light_status", result[0]['light_status']);
        io.sockets.emit("pump_status", result[0]['pump_status']);
        io.sockets.emit("mist_status", result[0]['mist_status']);
        io.sockets.emit("aero_status", result[0]['aerator_status']);
  
        // //console.log(result[0]);
  
        ////console.log(result[0]['fan_status']);
      });
  
  
    }, 2000);
  
  
    // setInterval(() => {
    //     con.query("SELECT * FROM `sensorreadings2` ORDER BY `id` DESC", function (err, result, fields) {
    //         // if (err) throw err;
    //         io.emit("humid", result[0]['Humidity']);
    //         io.emit("room_temp", result[0]['Room_Temp']);
  
    //         ////console.log(result[0]['fan_status']);
    //     });
    // }, 2000);
  
    socket.on("fan", (arg) => {
  
      if (arg == true) {
        io.sockets.emit("fan", arg);
        const url = "http://192.168.1.245/cm?cmnd=Power%20On";
        con.query(`UPDATE status SET fan_status = 'ON' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          //      //console.log(response)
  
        });
        // httpGetAsync(url);
        // //console.log(arg); // world
      }
      else {
        io.sockets.emit("fan", arg);
        const url = "http://192.168.1.245/cm?cmnd=Power%20Off";
        con.query(` UPDATE status SET fan_status = 'OFF' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
  
        request.get(url, (error, response, body) => {
          //   //console.log(response)
  
        });
        // httpGetAsync(url);
        //  //console.log(arg);
      }
    });
  
  
    socket.on("light", (arg) => {
  
      if (arg == true) {
        io.sockets.emit("light", arg);
        const url = "http://192.168.1.130/cm?cmnd=Power%20On";
        con.query(` UPDATE status SET light_status = 'ON' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          //   //console.log(response)
  
        });
        // httpGetAsync(url);
        // //console.log(arg); // world
      }
      else {
        io.sockets.emit("light", arg);
        con.query(` UPDATE status SET light_status = 'OFF' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
        const url = "http://192.168.1.130/cm?cmnd=Power%20Off";
  
        request.get(url, (error, response, body) => {
          // //console.log(response)
  
        });
        // httpGetAsync(url);
        //   //console.log(arg);
      }
    });
    socket.on("pump", (arg) => {
  
      if (arg == true) {
        io.sockets.emit("pump", arg);
        const url = "http://192.168.1.188/cm?cmnd=Power%20On";
        con.query(` UPDATE status SET pump_status = 'ON' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          //   //console.log(response)
  
        });
        // httpGetAsync(url);
        // //console.log(arg); // world
      }
      else {
        io.sockets.emit("pump", arg);
        const url = "http://192.168.1.188/cm?cmnd=Power%20Off";
        con.query(` UPDATE status SET pump_status = 'OFF' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          // //console.log(response)
  
        });
        // httpGetAsync(url);
        //  //console.log(arg);
      }
    });
    socket.on("mist", (arg) => {
  
      if (arg == true) {
        io.sockets.emit("mist", arg);
        const url = "http://192.168.1.107/cm?cmnd=Power%20On";
        con.query(` UPDATE status SET mist_status = 'ON' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          //  //console.log(response)
  
        });
        // httpGetAsync(url);
        //  //console.log(arg); // world
      }
      else {
        io.sockets.emit("mist", arg);
        const url = "http://192.168.1.107/cm?cmnd=Power%20Off";
        con.query(` UPDATE status SET mist_status = 'OFF' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          // //console.log(response)
  
        });
        // httpGetAsync(url);
        //   //console.log(arg);
      }
    });
  
    socket.on("aerator", (arg) => {
  
      if (arg == true) {
        io.sockets.emit("aero_status", arg);
        const url = "http://192.168.1.158/cm?cmnd=Power%20On";
        con.query(` UPDATE status SET aerator_status = 'ON' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          //  //console.log(response)
  
        });
        // httpGetAsync(url);
        //  //console.log(arg); // world
      }
      else {
        io.sockets.emit("aero_status", arg);
        const url = "http://192.168.1.158/cm?cmnd=Power%20Off";
        con.query(` UPDATE status SET aerator_status = 'OFF' WHERE status.id = 1;`, function (err, result, fields) {
  
          // if (err) throw err;
          ////console.log(result[0]['fan_status']);
        });
  
        request.get(url, (error, response, body) => {
          // //console.log(response)
  
        });
        // httpGetAsync(url);
        //   //console.log(arg);
      }
    });
  
    socket.on('nav1', function (args) {
      socket.on('timeOn', function (args1) {
        con.query(`UPDATE schedule SET time_on = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
        // io.sockets.emit('timeOn', args);
        // //console.log(args);
      });
  
      socket.on('timeOff', function (args1) {
        con.query(`UPDATE schedule SET time_off = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
  
  
        // //console.log(args);
      });
  
  
      socket.on('everyday', function (args) {
        con.query(`UPDATE schedule SET monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ? WHERE schedule.id = 1;`, [args, args, args, args, args, args, args], function (err, result, fields) {
        });
  
        //console.log(args);
      });
  
  
      socket.on('monday', function (args) {
        con.query(`UPDATE schedule SET monday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('tuesday', function (args) {
        con.query(`UPDATE schedule SET tuesday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
  
      socket.on('wednesday', function (args) {
        con.query(`UPDATE schedule SET wednesday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('thursday', function (args) {
        con.query(`UPDATE schedule SET thursday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('friday', function (args) {
        con.query(`UPDATE schedule SET friday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('saturday', function (args) {
        con.query(`UPDATE schedule SET saturday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('sunday', function (args) {
        con.query(`UPDATE schedule SET sunday = ? WHERE schedule.id = 1;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('reset', function (args) {
        if (args ==true) {
         
          con.query(`UPDATE schedule SET time_on = ?, time_off = ?,monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ?, everyday=?,displaytext=?, status = ? WHERE schedule.id = 1;`,[null,null,0,0,0,0,0,0,0,0,null,0] ,function (err, result, fields) {
            console.log(result);
          });
        } 
        //console.log(args);
      });

      socket.on('defaultGrowlights', function (args) {
        con.query(`UPDATE schedule SET time_on ="06:00", time_off = "20:00",monday = "1", tuesday = "1",wednesday = "1",thursday = "1",friday = "1",saturday = "1",sunday = "1" WHERE schedule.id = 1;`, function (err, result, fields) {
        });
        
        //console.log(args);
      });
      con.query(`SELECT * FROM schedule WHERE schedule.id=?;`, [args], function (err, result, fields) {
        socket.emit('rq1', result);
  
      });
  
    });
  
  
    socket.on('nav2', function (args) {
      socket.on('timeOn1', function (args1) {
        con.query(`UPDATE schedule SET time_on = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
        // io.emit('timeOn', args);
        // //console.log(args);
      });
  
      socket.on('timeOff1', function (args1) {
        con.query(`UPDATE schedule SET time_off = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
  
  
        // //console.log(args);
      });
  
  
      socket.on('everyday1', function (args) {
        con.query(`UPDATE schedule SET monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ? WHERE schedule.id = 2;`, [args, args, args, args, args, args, args], function (err, result, fields) {
        });
  
        //console.log(args);
      });
  
  
      socket.on('monday1', function (args) {
        con.query(`UPDATE schedule SET monday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('tuesday1', function (args) {
        con.query(`UPDATE schedule SET tuesday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
  
      socket.on('wednesday1', function (args) {
        con.query(`UPDATE schedule SET wednesday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('thursday1', function (args) {
        con.query(`UPDATE schedule SET thursday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('friday1', function (args) {
        con.query(`UPDATE schedule SET friday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('saturday1', function (args) {
        con.query(`UPDATE schedule SET saturday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('sunday1', function (args) {
        con.query(`UPDATE schedule SET sunday = ? WHERE schedule.id = 2;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('reset1', function (args) {
        if (args ==true) {
         
          con.query(`UPDATE schedule SET time_on = ?, time_off = ?,monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ?, everyday=?,displaytext=?, status = ? WHERE schedule.id = 2;`,[null,null,0,0,0,0,0,0,0,0,null,0] ,function (err, result, fields) {
            console.log(result);
          });
        } 
        //console.log(args);
      });
      socket.on('defaultWaterPump', function (args) {
        con.query(`UPDATE schedule SET time_on ="", time_off = "",monday = "1", tuesday = "1",wednesday = "1",thursday = "1",friday = "1",saturday = "1",sunday = "1", displaytext="ON/OFF Interval was set Every 30 mins", status = "1" WHERE schedule.id = 2;`, function (err, result, fields) {
        });
      });
      con.query(`SELECT * FROM schedule WHERE schedule.id=?;`, [args], function (err, result, fields) {
        socket.emit('rq2', result);
  
      });
  
  
    });
  
    socket.on('nav3', function (args) {
      socket.on('timeOn2', function (args1) {
        con.query(`UPDATE schedule SET time_on = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
        // io.emit('timeOn', args);
        // //console.log(args);
      });
  
      socket.on('timeOff2', function (args1) {
        con.query(`UPDATE schedule SET time_off = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
  
  
        // //console.log(args);
      });
  
  
      socket.on('everyday2', function (args) {
        con.query(`UPDATE schedule SET monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ? WHERE schedule.id = 3;`, [args, args, args, args, args, args, args], function (err, result, fields) {
        });
  
        //console.log(args);
      });
  
  
      socket.on('monday2', function (args) {
        con.query(`UPDATE schedule SET monday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('tuesday2', function (args) {
        con.query(`UPDATE schedule SET tuesday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
  
      socket.on('wednesday2', function (args) {
        con.query(`UPDATE schedule SET wednesday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('thursday2', function (args) {
        con.query(`UPDATE schedule SET thursday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('friday2', function (args) {
        con.query(`UPDATE schedule SET friday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('saturday2', function (args) {
        con.query(`UPDATE schedule SET saturday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('sunday2', function (args) {
        con.query(`UPDATE schedule SET sunday = ? WHERE schedule.id = 3;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('reset2', function (args) {
        if (args ==true) {
         
          con.query(`UPDATE schedule SET time_on = ?, time_off = ?,monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ?, everyday=?,displaytext=?, status = ? WHERE schedule.id = 3;`,[null,null,0,0,0,0,0,0,0,0,null,0] ,function (err, result, fields) {
            console.log(result);
          });
        } 
        //console.log(args);
      });
      con.query(`SELECT * FROM schedule WHERE schedule.id=?;`, [args], function (err, result, fields) {
        socket.emit('rq3', result);
  
      });
  
  
    });
  
  
  
    socket.on('nav4', function (args) {
      socket.on('timeOn3', function (args1) {
        con.query(`UPDATE schedule SET time_on = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
        // io.emit('timeOn', args);
        // //console.log(args);
      });
  
      socket.on('timeOff3', function (args1) {
        con.query(`UPDATE schedule SET time_off = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
  
  
        // //console.log(args);
      });
  
  
      socket.on('everyday3', function (args) {
        con.query(`UPDATE schedule SET monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ? WHERE schedule.id = 4;`, [args, args, args, args, args, args, args], function (err, result, fields) {
        });
  
        //console.log(args);
      });
  
  
      socket.on('monday3', function (args) {
        con.query(`UPDATE schedule SET monday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('tuesday3', function (args) {
        con.query(`UPDATE schedule SET tuesday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
  
      socket.on('wednesday3', function (args) {
        con.query(`UPDATE schedule SET wednesday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('thursday3', function (args) {
        con.query(`UPDATE schedule SET thursday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('friday3', function (args) {
        con.query(`UPDATE schedule SET friday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('saturday3', function (args) {
        con.query(`UPDATE schedule SET saturday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('sunday3', function (args) {
        con.query(`UPDATE schedule SET sunday = ? WHERE schedule.id = 4;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('reset3', function (args) {
        if (args ==true) {
         
          con.query(`UPDATE schedule SET time_on = ?, time_off = ?,monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ?, everyday=?,displaytext=?, status = ? WHERE schedule.id = 4;`,[null,null,0,0,0,0,0,0,0,0,null,0] ,function (err, result, fields) {
            console.log(result);
          });
        } 
        //console.log(args);
      });
      con.query(`SELECT * FROM schedule WHERE schedule.id=?;`, [args], function (err, result, fields) {
        socket.emit('rq4', result);
  
      });
  
  
    });
  
    socket.on('nav5', function (args) {
      socket.on('timeOn4', function (args1) {
        con.query(`UPDATE schedule SET time_on = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
        // io.emit('timeOn', args);
        // //console.log(args);
      });
  
      socket.on('timeOff4', function (args1) {
        con.query(`UPDATE schedule SET time_off = ? WHERE schedule.id = ?;`, [args1, args], function (err, result, fields) {
        });
  
  
        // //console.log(args);
      });
  
  
      socket.on('everyday4', function (args) {
        con.query(`UPDATE schedule SET monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ? WHERE schedule.id = 5;`, [args, args, args, args, args, args, args], function (err, result, fields) {
        });
  
        //console.log(args);
      });
  
  
      socket.on('monday4', function (args) {
        con.query(`UPDATE schedule SET monday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('tuesday4', function (args) {
        con.query(`UPDATE schedule SET tuesday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
  
      socket.on('wednesday4', function (args) {
        con.query(`UPDATE schedule SET wednesday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('thursday4', function (args) {
        con.query(`UPDATE schedule SET thursday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('friday4', function (args) {
        con.query(`UPDATE schedule SET friday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('saturday4', function (args) {
        con.query(`UPDATE schedule SET saturday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('sunday4', function (args) {
        con.query(`UPDATE schedule SET sunday = ? WHERE schedule.id = 5;`, [args], function (err, result, fields) {
        });
        //console.log(args);
      });
  
      socket.on('reset4', function (args) {
        
        if (args ==true) {
         
          con.query(`UPDATE schedule SET time_on = ?, time_off = ?,monday = ?, tuesday = ?,wednesday = ?,thursday = ?,friday = ?,saturday = ?,sunday = ?, everyday=?,displaytext=?, status = ? WHERE schedule.id = 5;`,[null,null,0,0,0,0,0,0,0,0,null,0] ,function (err, result, fields) {
            console.log(result);
          });
        } 
        
        //console.log(args);
      });
      
      socket.on('defaultAerator', function (args) {
        if (args==true) {
          con.query(`UPDATE schedule SET monday = '1', tuesday = '1', wednesday = '1', thursday = '1', friday = '1', saturday = '1', sunday = '1', everyday = '1', displaytext='ON/OFF Interval was set Every 30 mins', status = '1' WHERE schedule.id = 5;`, function (err, result, fields) {
          });
        }
      
        //console.log(args);
      });
      con.query(`SELECT * FROM schedule WHERE schedule.id=?;`, [args], function (err, result, fields) {
        socket.emit('rq5', result);
        //console.log(result);
  
      });
  
  
    });

  
     
  
  
  
    function dateFormatter(dateString) {
    //  const dateString = 'Mon Mar 27 2023 00:00:00 GMT+0800 (Philippine Standard Time)';
  const date = new Date(dateString);
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  //console.log(formattedDate);
  return formattedDate;
   // Output: 2023-03-27 00:00:00
  
    }
  socket.on('fetch-dates', function (args) {
  let startDate = args[0];
  let endDate = args[1];
  
  // //console.log();
  // //console.log(dateFormatter(endDate.toString()));
  
  var formattedStartDate = dateFormatter(startDate.toString());
  var formattedEndDate = dateFormatter(endDate.toString());
    con.query(`SELECT * FROM sensorreadings1 WHERE DATE >= ? AND DATE <= ? ORDER BY DATE DESC;`,[formattedStartDate,formattedEndDate], function (err, result, fields) {
     //console.log(result);
     con.query(`SELECT * FROM sensorreadings2 WHERE DATE >= ? AND DATE <= ? ORDER BY DATE DESC;`,[formattedStartDate,formattedEndDate], function (err, result1, fields) {
      //console.log(result1);
      
       io.emit('return-data', result,result1 );
     });
      
    });
  })
  
  
  socket.on('fetch-dates1', function (args) {
    let startDate = args[0];
    let endDate = args[1];
    
    // //console.log();
    // //console.log(dateFormatter(endDate.toString()));
    
    var formattedStartDate = dateFormatter(startDate.toString());
    var formattedEndDate = dateFormatter(endDate.toString());
   
       con.query(`SELECT * FROM sensorreadings2 WHERE DATE >= ? AND DATE <= ? ORDER BY DATE DESC;`,[formattedStartDate,formattedEndDate], function (err, result1, fields) {
        //console.log(result1);
        
         io.emit('return-data1',result1 );
       });
        
     
    })
      
  
  
  
  
  
  


  



    // //console.log("Socket Connected");
    socket.on('Forgot-Password-Email', function (args) {
        ////console.log(args);
        con1.query(`SELECT * FROM users where email= ?`, [args], function (err, result, fields) {

            if (result.length > 0) {
                socket.emit('Forgot-Password-Success', "success", args);
                var password = result[0]['password'];

                // const hash = CryptoJS.MD5(password).toString();
                transporter.sendMail({
                    from: 'hydroponicsystem2023@gmail.com', // sender address
                    to: args, // list of receivers
                    subject: 'Casa Selada password recovery', // Subject line
                    text: `Hi ${args}. Here is your account password ${password}.`, // plain text body
                    //  html: '<b>Hello world?</b>' // html body
                }, (error, info) => {
                    if (error) {
                        //  return //console.log(error);
                    }
                    else {

                    }
                    // //console.log('Message sent: %s', info.messageId);
                },
                );


            }
            else {
                socket.emit('Forgot-Password-Success', "failed", args);
            }



        });





    });

    socket.on('Register', function (name,email,pass,confirm) {
        //console.log(name);
        //console.log(email);
        //console.log(pass);
        //console.log(confirm);

        function generateRandomString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              result += characters.charAt(randomIndex);
            }
            return result;
          }
          
        con1.query(`SELECT * FROM users where email= ?`, [email], function (err, result, fields) {

            if (pass != confirm) {
                socket.emit('registered-failed','true');
            }
            else if (result.length>0) {
                socket.emit('registered-failed','registered-already');
            }
            else{

          
                var code = generateRandomString(8);

                //console.log(code);
                transporter.sendMail({
                    from: 'hydroponicsystem2023@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: 'Casa Selada account verification', // Subject line
                    text: `Hi ${name}. Here is your verification link  https://hydro.casaselada.xyz/verify?code=${code}&email=${email}.`, // plain text body
                    //  html: '<b>Hello world?</b>' // html body
                }, (error, info) => {
                    if (error) {
                        //  return //console.log(error);
                    }
                    else {
                                    socket.emit('registered-failed','registered-success');
                    }
                    // //console.log('Message sent: %s', info.messageId);
                },
                );
        con1.query(`INSERT INTO users (id, name, email, password, code) VALUES (NULL, ?, ?, ?, ?);`, [name,email,pass,code], function (err, result, fields) {
            //console.log('Account registered')
            });
   
            }
      
        });
 
    

        app.get('/verify', (req, res) => {


            con1.query(`SELECT * FROM users where email= ?`, [req.query.email], function (err, result, fields) {
              if(result[0]['code'] == req.query.code){
      
                  con1.query(`UPDATE users SET code = 'verified' WHERE users.email = ?;`, [req.query.email], function (err, result, fields) {
                      res.render('verified');
                     
      
                  });
      
      
                  
                
                  
              }
            })
          
      });
      


    });


    // socket.on('Login', function(email,password) {
    //     //console.log(email);
    //     //console.log(password);
    //     con.query(`SELECT * FROM users where email= ?`, [email], function (err, result, fields) {

    //         if (email == result[0]['email'] && password == result[0]['password'] && result[0]['code'] == 'verified') {
    //             socket.emit('Login-Status','success');
    //         }
    //         else{
    //             socket.emit('Login-Status','success');
    //         }
      
    //     });

    // });
 

});


  
const realtimeChart1 = () => {
  const args = [];
  const today = new Date();
for (let i = 6; i >= 0; i--) {
const date = new Date(today);
date.setDate(today.getDate() - i);
args.push(date.toLocaleDateString());
// labels2.push(date);
}
 
let ph = [];

let water_temp = [];
let ec = [];
let chart1 = [];
  // //console.log(result);
  // //console.log(result1);
let temp1 = [];
let temp2 = [];
let temp3 = [];
let temp4 = [];
let temp5 = [];
let temp6 = [];
let temp7 = [];

let temp11= [];
let temp12= [];
let temp13= [];
let temp14= [];
let temp15= [];
let temp16= [];
let temp17= [];

let temp21= [];
let temp22= [];
let temp23= [];
let temp24= [];
let temp25= [];
let temp26= [];
let temp27= [];


let storage = [
  temp1,
  temp2,
  temp3,
  temp4,
  temp5,
  temp6,
  temp7

];

let storage1 = [
  temp11,
  temp12,
  temp13,
  temp14,
  temp15,
  temp16,
  temp17

];

let storage2 = [
  temp21,
  temp22,
  temp23,
  temp24,
  temp25,
  temp26,
  temp27

];


//console.log(args);

function calculateAverage(temp) {
  var total = 0;
  var avg = 0
  for (var i = 0; i < temp.length; i++) {
    total += temp[i];
  }
   avg = total / temp.length;
    avg = parseFloat(avg).toFixed(2);
  return avg;
}

////console.log(calculateAverage([12,21,12,32,12,45,65,12,11]));

con.query(`SELECT * FROM sensorreadings1`, function (err, result, fields) {


  // for (let index = 0; index < result.length; index++) {
  //   let date = result[index]['DATE'].toLocaleDateString();

  //   for (let j = 0; j < args.length; j++) {
  //     if(date == args[0])
  //     {
  //       temp.push(result[index]['PH']);
  //      // //console.log(result)
  //     }

  //   }


  // }




  for (let j = 0; j < result.length; j++) {
    let date = result[j]['DATE'].toLocaleDateString();
    let ph = result[j]['Ph_Value'];
    if (args[0] == date && date != null) {
      storage[0].push(result[j]['Water_Temperature']);
      storage1[0].push(result[j]['Ph_Value']);
      storage2[0].push(result[j]['Ec_Value']);
    }
    else if (args[1] == date && date != null) {
      storage[1].push(result[j]['Water_Temperature']);
      storage1[1].push(result[j]['Ph_Value']);
      storage2[1].push(result[j]['Ec_Value']);
    }
    else if (args[2] == date && date != null) {
      storage[2].push(result[j]['Water_Temperature']);
      storage1[2].push(result[j]['Ph_Value']);
      storage2[2].push(result[j]['Ec_Value']);
    }
    else if (args[3] == date && date != null) {
      storage[3].push(result[j]['Water_Temperature']);
      storage1[3].push(result[j]['Ph_Value']);
      storage2[3].push(result[j]['Ec_Value']);
    }
    else if (args[4] == date && date != null) {
      storage[4].push(result[j]['Water_Temperature']);
      storage1[4].push(result[j]['Ph_Value']);
      storage2[4].push(result[j]['Ec_Value']);
    }
    else if (args[5] == date && date != null) {
      storage[5].push(result[j]['Water_Temperature']);
      storage1[5].push(result[j]['Ph_Value']);
      storage2[5].push(result[j]['Ec_Value']);
    }
    else if (args[6] == date && date != null) {
      storage[6].push(result[j]['Water_Temperature']);
      storage1[6].push(result[j]['Ph_Value']);
      storage2[6].push(result[j]['Ec_Value']);
    }
    else {
      storage[j] = [];
    }

  }

 
  for (let i = 0; i < 7; i++) {

    water_temp.push(calculateAverage(storage[i]));
    ph.push(calculateAverage(storage1[i]));
    ec.push(calculateAverage(storage2[i]));
    
   /// //console.log(calculateAverage(storage[i]));
   // //console.log(storage[i])

  }
chart1.push(water_temp,ph,ec);
  //console.log(water_temp);
  // //console.log(temp);
  io.sockets.emit('chart1', chart1);
  //io.emit('ph', ph);

 
  })

}
// socket.on('res', function (args) {

  setInterval(realtimeChart1,1000);

  
     
 const realtimeChart2 = () =>{

  const args = [];
  const today2 = new Date();
  for (let i = 6; i >= 0; i--) {
    const date2 = new Date(today2);
    date2.setDate(today2.getDate() - i);
    args.push(date2.toLocaleDateString());
    
  }
    var dates = [];
    var datedData = [];
  
    let ph = [];
    let room_temp = [];
    let humidity = [];
    let chart2 = [];
      // //console.log(result);
      // //console.log(result1);
    let temp1 = [];
    let temp2 = [];
    let temp3 = [];
    let temp4 = [];
    let temp5 = [];
    let temp6 = [];
    let temp7 = [];
  
   let temp11= [];
   let temp12= [];
   let temp13= [];
   let temp14= [];
   let temp15= [];
   let temp16= [];
   let temp17= [];
  
    let storage = [
      temp1,
      temp2,
      temp3,
      temp4,
      temp5,
      temp6,
      temp7
  
    ];
  
    let storage1 = [
      temp11,
      temp12,
      temp13,
      temp14,
      temp15,
      temp16,
      temp17
  
    ];
  
  
    //console.log(args);
  
    function calculateAverage(temp) {
      var total = 0;
      var avg = 0
      for (var i = 0; i < temp.length; i++) {
        total += temp[i];
      }
       avg = total / temp.length;
        avg = parseFloat(avg).toFixed(2);
      return avg;
    }
  
    ////console.log(calculateAverage([12,21,12,32,12,45,65,12,11]));
  
    con.query(`SELECT * FROM sensorreadings2`, function (err, result, fields) {
    
  
      // for (let index = 0; index < result.length; index++) {
      //   let date = result[index]['DATE'].toLocaleDateString();
  
      //   for (let j = 0; j < args.length; j++) {
      //     if(date == args[0])
      //     {
      //       temp.push(result[index]['PH']);
      //      // //console.log(result)
      //     }
  
      //   }
  
  
      // }
  
  
  
  
      for (let j = 0; j < result.length; j++) {
        let date = result[j]['DATE'].toLocaleDateString();
        let ph = result[j]['Ph_Value'];
        if (args[0] == date && date != null) {
          storage[0].push(result[j]['Room_Temp']);
          storage1[0].push(result[j]['Humidity']);
         
        }
        else if (args[1] == date && date != null) {
          storage[1].push(result[j]['Room_Temp']);
          storage1[1].push(result[j]['Humidity']);
         
        }
        else if (args[2] == date && date != null) {
          storage[2].push(result[j]['Room_Temp']);
          storage1[2].push(result[j]['Humidity']);
         
        }
        else if (args[3] == date && date != null) {
          storage[3].push(result[j]['Room_Temp']);
          storage1[3].push(result[j]['Humidity']);
        
        }
        else if (args[4] == date && date != null) {
          storage[4].push(result[j]['Room_Temp']);
          storage1[4].push(result[j]['Humidity']);
       
        }
        else if (args[5] == date && date != null) {
          storage[5].push(result[j]['Room_Temp']);
          storage1[5].push(result[j]['Humidity']);
        
        }
        else if (args[6] == date && date != null) {
          storage[6].push(result[j]['Room_Temp']);
          storage1[6].push(result[j]['Humidity']);
         
        }
        else {
          storage[j] = [];
        }
  
      }
  
     
      for (let i = 0; i < 7; i++) {
  
        room_temp.push(calculateAverage(storage[i]));
        humidity.push(calculateAverage(storage1[i]));
        // ph.push(calculateAverage(storage1[i]))
       /// //console.log(calculateAverage(storage[i]));
       // //console.log(storage[i])
  
      }
  chart2.push(room_temp,humidity);
    //  //console.log(water_temp);
      // //console.log(temp);
      io.sockets.emit('chart2', chart2);
      //io.emit('ph', ph);
  
     
      })
     
       
   
 }

// });


setInterval(realtimeChart2,1000);





var day = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// let index = d.getDay();

// var time = hour + ":"+ minutes;

const renderTime = () => {
  const d = new Date();
  let hour = d.getHours();
  let minutes = d.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  //Grow Light
  ////console.log(hour +':'+ minutes)
  con.query(`SELECT * FROM schedule WHERE schedule.id=1;`, function (err, result, fields) {
  //  //console.log(result);

    if (result[0][day[d.getDay()]] == 1 && result[0]['time_on'] == hour + ":" + minutes) {
     // //console.log('functioning...');
      const url = "http://192.168.1.130/cm?cmnd=Power%20On";
      request.get(url, (error, response, body) => { });
    }
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_off'] == hour + ":" + minutes) {
      const url = "http://192.168.1.130/cm?cmnd=Power%20Off";
      request.get(url, (error, response, body) => { });
    }
  });

  //Water pump
  con.query(`SELECT * FROM schedule WHERE schedule.id=2;`, function (err, result, fields) {
   // //console.log(result);
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_on'] == hour + ":" + minutes) {
      //   //console.log('functioning...');
      const url = "http://192.168.1.188/cm?cmnd=Power%20On";
      // request.get(url, (error, response, body) => { });
    }
     if (result[0]['status']== "1" && result[0][day[d.getDay()]] == 1 && minutes == "30" ) {
      const url = "http://192.168.1.188/cm?cmnd=Power%20On";
    //  console.log("Water Pump is on");
       request.get(url, (error, response, body) => { });
    }
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_off'] == hour + ":" + minutes) {
      const url = "http://192.168.1.188/cm?cmnd=Power%20Off";
     
      //request.get(url, (error, response, body) => { });
    }
     if (result[0]['status']== "1" && result[0][day[d.getDay()]] == 1 && minutes == "00" ) {
      const url = "http://192.168.1.188/cm?cmnd=Power%20Off";
       request.get(url, (error, response, body) => { });
    //  console.log("Water Pump is off");
    }
  });

  //Mist 
  con.query(`SELECT * FROM schedule WHERE schedule.id=3;`, function (err, result, fields) {
   // //console.log(result);
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_on'] == hour + ":" + minutes) {
      //   //console.log('functioning...');
      const url = "http://192.168.1.107/cm?cmnd=Power%20On";
      request.get(url, (error, response, body) => { });
    }
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_off'] == hour + ":" + minutes) {
      const url = "http://192.168.1.107/cm?cmnd=Power%20Off";
      request.get(url, (error, response, body) => { });
    }
  });

  //fan
  con.query(`SELECT * FROM schedule WHERE schedule.id=4;`, function (err, result, fields) {
  //  //console.log(result);
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_on'] == hour + ":" + minutes) {
      //   //console.log('functioning...');
      const url = "http://192.168.1.245/cm?cmnd=Power%20On";
      request.get(url, (error, response, body) => { });
    }
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_off'] == hour + ":" + minutes) {
      const url = "http://192.168.1.245/cm?cmnd=Power%20Off";
      request.get(url, (error, response, body) => { });
    }
  });

  //aerator

  con.query(`SELECT * FROM schedule WHERE schedule.id=5;`, function (err, result, fields) {
    ////console.log(result);
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_on'] == hour + ":" + minutes && result[0]['status']== "0" ) {
      //   //console.log('functioning...');
      const url = "http://192.168.1.158/cm?cmnd=Power%20On";
      request.get(url, (error, response, body) => { });
    }
     if (result[0]['status']== "1" && result[0][day[d.getDay()]] == 1 && minutes == "30" ) {
      const url = "http://192.168.1.158/cm?cmnd=Power%20On";
   //   console.log("Aerator is on");
       request.get(url, (error, response, body) => { });
    }
    if (result[0][day[d.getDay()]] == 1 && result[0]['time_off'] == hour + ":" + minutes) {
      const url = "http://192.168.1.158/cm?cmnd=Power%20Off";
      request.get(url, (error, response, body) => { });
    }
   if (result[0]['status']== "1" && result[0][day[d.getDay()]] == 1 && minutes == "00" ) {
      const url = "http://192.168.1.158/cm?cmnd=Power%20Off";
       request.get(url, (error, response, body) => { });
     // console.log("Aerator is off");
    }
  });



}

setInterval(renderTime, 1000);




io.sockets.on("error", e => console.log(e));


app.use('/route', router);



// home route

// app.get('/', (req, res) => {
//     res.render('login', { title: "Casa Selada" });
// });

app.get('/', (req, res) => {
  res.render('dashboard', { title: "Casa Selada" });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: "Casa Selada" });
});

app.get('/control', (req, res) => {
  res.render('control');
});





server.listen(port, () => { console.log(`Listening to the server on http://localhost:${port}`) });
