const { render } = require("ejs");
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: "Sudhriti123",
    resave: false,
    saveUninitialized: true,
}))

const db = new sqlite3.Database(":tweets");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS twitts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        twitt TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        random_number INTEGER
    )`);
})

let twitt_list = []

function generateRandomNumber() {
    return Math.floor(10000 + Math.random() * 90000); // Generates a number between 10000 and 99999
}

app.get("/", (req, res) => {
    res.render('login')
});


app.post("/submit", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username,password);

    req.session.username = username;

    setTimeout(() => {
        res.redirect("/home");
    }, 2000);
    
});

app.get("/home", isAuthenticated, (req, res) => {
    const username = req.session.username;
    db.all('SELECT * FROM twitts ORDER BY created_at DESC',[], (err, rows) => {
        if (err) {
            console.log(err.message);
        }
        res.render("home.ejs", {username:username, twitt_list:rows});
    })
    
});




app.get("/new_twitt", isAuthenticated, (req, res) => {
    res.render("new_twitt.ejs");
});

app.post("/create", (req,res) => {
    const twitt = req.body.twitt;
    const username = req.session.username;
    
    if (username && twitt) {
        // Insert the new twitt into the database
        db.run(`INSERT INTO twitts (username, twitt) VALUES (?, ?)`, [username, twitt], (err) => {
            if (err) {
                console.error(err.message);
            }
            res.redirect("/home");
        });
    } else {
        res.redirect("/new_twitt");
    }
})



app.get("/signup", (req,res) => {
   res.render("sign_up.ejs")
})


app.post("/signup", (req,res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const randomNumber = generateRandomNumber();


    db.run(`INSERT INTO users (name, email, phone, random_number) VALUES (?, ?, ?, ?)`,
        [name, email, phone, randomNumber], (err) => {
            if (err) {
                console.error(err.message);
                res.send("Error during sign up");
            } else {
                res.render("number_popup.ejs", { randomNumber: randomNumber });
            }
        });
    console.log(randomNumber)
});


app.get("/signout", (req,res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/home");
        }
    });
    res.redirect("/");
})

function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    } else {
        res.redirect("/")
    }
}













app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})


// Hello this line should not show in the master branch !!