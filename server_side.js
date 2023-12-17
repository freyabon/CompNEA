const express = require('express');
const {createPool} = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const pool = createPool({
    host: "localhost",
    user: "Freya",
    password: "Ozymandias1!",
    database: "sustainablestocks",
    connectionLimit: 10
});

app.use(cors());
app.use(bodyParser.json());

app.get('/getUserDetails', (req, res) => {
    pool.query('SELECT * FROM sustainablestocks.userdetails', (err, results) => {
        if (err) {
            console.error(err, "server");
            res.status(500).send('Internal server error');
            return;
        }
        res.json(results)
    });
});

app.post('/registerUserDetails', (req, res) => {
    const { Username, Password } = req.user;
    console.log(req.user);

    if (!Username || !Password) {
        res.status(400).send('All fields must be completed');
        return;
    }

    const RegisterQuery = 'INSERT INTO sustainablestocks.userdetails (Username, Password) VALUES (?, ?)';
    const RegisterValues = [Username, Password];

    pool.query(RegisterQuery , RegisterValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send('User data inserted successfully');   
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});