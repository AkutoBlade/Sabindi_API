const db = require("../config/dbconn");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// const app = express();
const router = express.Router();

// All USERS
router.get("/users", (req, res) => {
    const getAll = `
          SELECT * FROM users
      `;
  
    db.query(getAll, (err, results) => {
      if (err) throw err;
      res.json({
        status: 200,
        users: results,
      });
    });
  });

   // SINGLE USER
 router.get('/users/:id', (req, res) => {
    // Query
  
    console.log(req.params.id)
    const strQry =
        `
    SELECT *
    FROM users
    WHERE uid = ${req.params.id};
    `;
    db.query(strQry, [], (err, results) => {
        if (err) throw err;
        res.json({
            status: 200,
            results: (results.length <= 0) ? "Sorry, no user was found." : results
        })
    })
  });

// REGISTER
router.post('/register', bodyParser.json(),async (req, res) => {
    const emails = `SELECT * FROM users WHERE user_email = ?`;
    const bd = req.body;
  
     const  email = bd.user_email;
     console.log(email);
    

    db.query(emails, email , async (err, results) =>{
      if(results.length > 0){
     res.json({
      msg:"The email already exist"
    });
   
  }
      else{
      let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "jared.sabindi@gmail.com",
                    pass: "hwkvzcftvpuepjwo"
                },
                tls: {
                  rejectUnauthorized: false
              }
            });
            
    bd.user_password = await bcrypt.hash(bd.user_password, 10)
    bd.user_created = `${new Date().toISOString().slice(0, 10)}`;
    if (bd.user_type === '' || bd.user_type === null) {
      bd.user_type= 'client'
    }
    let details = {
      from: "jared.sabindi@gmail.com",
      to: `${bd.user_email}`,
      subject: "Sabindi Group Global",
      text: `Welcome To Sabindi Group Global ${bd.user_name} ${bd.user_surname}`
  }
  mailTransporter.sendMail(details,(err)=>{
    if(err)  throw  err
    else{
        console.log("Email have been sent");
    }
})
    let sql = `INSERT INTO users (user_name, user_surname, user_email, user_password, user_contact, user_type, user_quote, user_created)VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [bd.user_name, bd.user_surname, bd.user_email, bd.user_password, bd.user_contact, bd.user_type, bd.user_quote, bd.user_created ], (err, results) => {
      if (err){
          return {
            msg: "The email already exist"
          }
      }
      else {
        const qe = `SELECT * FROM users WHERE user_email = ?`;
        db.query(qe, email, (err, results) =>{
          if (err){
            return {
              msg: "something went wrong 404"
            }
        } else{
          const payload = {
            user: {
                user_name: results[0].user_name,
                user_surname: results[0].user_surnme,
                user_email: results[0].user_email,
                user_password: results[0].user_password,
                user_contact: results[0].user_contact,
                user_type: results[0].user_type,
                user_quote: results[0].user_quote,
                user_created: results[0].user_created
            },
        };
        jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: "365d"
        }, (err, token) => {
            if (err) throw err;
            res.json({
              results: results,
              token: token
            })
            // res.status(200).send("Logged in");
        });
        }
        });

      }
    })};
    })

  });

// lOGIN --
router.post('/login',bodyParser.json(),(req,res) => {
  let sql = `SELECT * FROM users WHERE user_email LIKE ?`
  let email =  req.body.user_email
  db.query(sql,email, async (err,results) => {
    if(err) throw err
    console.log(results.length)
   if(results.length === 0 ){
      res.json({
        msg: "Email does not exist"
      })
    }else{
        console.log(results)
      const isMatch = await bcrypt.compare(req.body.user_password, results[0].user_password);
      if(!isMatch){
        res.json({
          msg: "Incorrect Password"
        })
      }else{
        const payload = {
          user: {
              user_name: results[0].user_name,
              user_surname: results[0].user_surname,
              user_email: results[0].user_email,
              user_password: results[0].user_password,
              user_contact: results[0].user_conact,
              user_type: results[0].user_type,
              user_quote: results[0].user_quote,
              user_created: results[0].user_created
          },
      };
      jwt.sign(payload, process.env.SECRET_KEY, {
          expiresIn: "365d"
      }, (err, token) => {
          if (err) throw err;
          res.json({
            results: results,
            token: token
          })
          // res.status(200).send("Logged in");
      });
      }
    }
  })
});

//UPDATE
router.put('/users/:id',bodyParser.json(),(req, res) => {
    const bd = req.body;
   bd.user_password =  bcrypt.hashSync(bd.user_password, 10)
    // Query
    const strQry =
        `UPDATE users
     SET user_name = ?, user_surname = ?, user_email = ?,user_password = ?, user_contact = ?
     WHERE uid = ${req.params.id}`;
  
    db.query(strQry, [bd.user_name, bd.user_surname, bd.user_email, bd.user_password, bd.user_contact ], (err, data) => {
        if (err) throw err;
        res.json({
          msg:`Updated User`
        });
    })
  });

 //DELETE
 router.delete('/users/:id', (req, res) => {
  // Query
  const strQry =
      `
  DELETE FROM users
  WHERE uid = ?;
  `;
  db.query(strQry, [req.params.id], (err, data, fields) => {
      if (err) throw err;
      res.send(`${data.affectedRows} row was affected`);
  })
});

//DELETE ALL
router.delete('/users',(req, res) =>{
  const strQry =
      `
  DELETE FROM users;
  `;

  db.query(strQry, (err, data, fields) => {
    if (err) throw err;
    res.send(`${data.affectedRows} row was affected`);
})
})


module.exports= router