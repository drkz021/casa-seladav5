var express = require("express");
var router = express.Router();

const  credential = {
    email : "admin.local",
    password : "admin123",
    email1: "raspberrypi.local",
}


const nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'hydroponicsystem2023@gmail.com',
        pass: 'dbnpsvffdkcypuwy'
    }
});

var mysql = require('mysql');
//const { send } = require("process");

var con1 = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "opticfiber01",
    database: "login"
});

con1.connect(function (err) {
    // if (err) throw err;
    // console.log("Connected!");
    // res.send('Connected to DATABASE');
});

// setup email data with unicode symbols
// let mailOptions = {
//     from: 'hydroponicsystem2023@gmail.com', // sender address
//     to: 'cleinduquez11@gmail.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'no reply', // plain text body
//     html: '<b>Hello world?</b>' // html body
// };



// login user
router.get('/login', (req, res)=>{
  

    con1.query(`SELECT * FROM users`, function (err, result, fields) {
   



        let isLogin = result.find((res) => 
            res.email == req.query.email && res.password == req.query.password && res.code == 'verified'
        );

        let isNotVerified = result.find((res) => 
        res.email == req.query.email && res.password == req.query.password && res.code != 'verified'
    );
  
  
        if (isLogin != null ) {
                  req.session.user = req.query.email ;
            //res.send('Logged IN');
             res.redirect('/route/dashboard');
            
        }
        else if (isNotVerified != null ) {
            req.session.user = req.query.email ;
      //res.send('Logged IN');
      res.redirect('/route/not_verified');
      
  }
        else{
            res.redirect('/route/error');
        }

        //     for (let i = 0; i < result.length; i++) {
     
        //         if( result[i]['email'] == req.query.email && result[i]['password'] == req.query.password && result[i]['code']== 'verified'){
        //             isLogIn = true;
                
        //            // isVerified = true;
        //             //res.end("Login Successful...!");
        //         }
        //         else if ( result[i]['email'] == req.query.email && result[i]['password'] == req.query.password && result[i]['code']!= 'verified') {
        //             isVerified = false;
        //         }
        //         else{
        //             isLogIn = false;
        //         }
               
           
          
            
        //  }

        //  if (isLogIn) {
        //     req.session.user = req.query.email ;
        //     //res.send('Logged IN');
        //      res.redirect('/route/dashboard');
        //  }
        //   else if (isVerified ==false) {
        //     res.redirect('/route/not_verified');
        //  }
        //  else
        //  {
        //     res.redirect('/route/error');
        //  }



      
        //console.log(result);
  
    //     for (let i = 0; i < result.length; i++) {
    //         credentials.push(result[i]);
            
    //     }
    //     if (credentials.length > 0) {
    //              for (let i = 0; i < credentials.length; i++) {
       
    //         if(req.query.email == credentials[i]['email'] && req.query.password ==  credentials[i]['password'] && credentials[i]['code']== 'verified'){
    //             req.session.user = req.query.email ;
    //             //res.send('Logged IN');
    //              res.redirect('/route/dashboard');
    //             //res.end("Login Successful...!");
    //         }
    //         else{
    //           //  res.send('Failed');
    //             res.render('error');
    //         }
    //     }
      
        
    //  }

        
    
    });   

  
//     console.log(req.query.email);
//    console.log(req.query.password);
//    console.log(req.session);
    
    
});





router.get('/register', (req, res) => {
  res.render('register', {title: "Register"} );
});


router.get('/casa/login', (req, res) => {

    
    res.render('login', {title: "Login"} );
  });

  router.get('/forgotPass', (req, res) => {
    res.render('forgotPass', {title: "Forgot Password"} );
  });


  router.get('/sendSMTP', (req, res) => {

  //  res.send('sent');
    console.log(req.query.email);
 
    transporter.sendMail( {
        from: 'hydroponicsystem2023@gmail.com', // sender address
        to:  req.query.email.toString(), // list of receivers
        subject: 'Casa Selada verification', // Subject line
        text: 'Here is your password', // plain text body
      //  html: '<b>Hello world?</b>' // html body

    }, (error, info) => {
        if (error) {
            return console.log(error);
        }
       // console.log('Message sent: %s', info.messageId);
    },
    );

   
       // alert(`Email is sent to ${req.query.email}`);
        res.redirect('/route/casa/login')
    //   res.send(`
    //   <script>
      
    //     window.location.href = '/route/forgotPass';

       
    //   </script>
    // `);
  });
router.get('/error', (req, res) => {
    res.render('error',{title: "Error Prompt"})
});


router.get('/not_verified', (req, res) => {
    res.render('not_verified',{title: "Not_verified Prompt"})
});
router.get('/verify', (req, res) => {

    res.render('error',{title: "Error Prompt"})
});

router.get('/LOGIN', (req, res) => {

    res.send('logged in')
})

// route for dashboard
router.get('/dashboard', (req, res) => {
    if(req.session.user){
        res.render('dashboard',{title: "Fiber Optic Dashboard"})
    }else{
        res.render('error');
    }
});

// route for control
router.get('/control', (req, res) => {
    res.render('control');
});


// route for logout
router.get('/logout', (req ,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.render('login', { title: "Express", logout : "logout Successfully...!"})
        }
    })
})

module.exports = router;
