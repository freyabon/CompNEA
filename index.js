const express = require('express');
const {createPool} = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 2500;
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
    const { Username } = req.query;
    console.log(req.query)

    if (!Username) {
        res.status(400).send('Username must be provided');
        return;
    }

    const SelectQuery = 'SELECT Password FROM sustainablestocks.userdetails WHERE Username = ?';
    const SelectValues = [Username];

    pool.query(SelectQuery , SelectValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results)   
    });
});

app.get('/getSavedTickers', (req, res) => {
    const { Username } = req.query;
    console.log(req.query)

    if (!Username) {
        res.status(400).send('Username must be provided');
        return;
    }

    const SelectSavedQuery = 'SELECT tickerid FROM sustainablestocks.savedtickers WHERE Username = ?';
    const SelectSavedValues = [Username];

    pool.query(SelectSavedQuery , SelectSavedValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results)   
    });
});

app.get('/getTickerData', (req, res) => {
    const { tickerid } = req.query;
    console.log(req.query)

    if (!tickerid) {
        res.status(400).send('TickerID must be provided');
        return;
    }

    const SelectQuery = 'SELECT * FROM sustainablestocks.tickerdata WHERE tickerid = ?';
    const SelectValues = [tickerid];

    pool.query(SelectQuery , SelectValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results)   
    });
});

app.get('/getTickerList', (req, res) => {
    const SelectQuery = 'SELECT tickerid, tickername, continent FROM sustainablestocks.tickerlist JOIN sustainablestocks.region ON sustainablestocks.tickerlist.regionid = sustainablestocks.region.regionid';

    pool.query(SelectQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});


app.post('/registerUserDetails', (req, res) => {
    const { Username, Password } = req.body;
    console.log(req.body);

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

app.post('/saveTicker', (req, res) => {
    const { Username, tickerid } = req.body;
    console.log(req.body);

    if (!Username || !tickerid) {
        res.status(400).send('All fields must be completed');
        return;
    }

    const SaveTickerQuery = 'INSERT INTO sustainablestocks.savedtickers (Username, tickerid) VALUES (?, ?)';
    const SaveTickerValues = [Username, tickerid];

    pool.query(SaveTickerQuery , SaveTickerValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send('Saved ticker inserted successfully');   
    });
});

app.delete('/unsaveTicker', (req, res) => {
    const { Username, tickerid } = req.body;
    console.log(req.body);

    if (!Username || !tickerid) {
        res.status(400).send('All fields must be completed');
        return;
    }

    const UnsaveTickerQuery = 'DELETE FROM sustainablestocks.savedtickers WHERE tickerid = ?';
    const UnsaveTickerValues = [tickerid];

    pool.query(UnsaveTickerQuery , UnsaveTickerValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send('Unsaved ticker successfully');   
    });
});

app.post('/updateTickerTable', (req, res) => {
    const { tickerid, date, open, high, low, close, volume } = req.body;
    console.log(req.body);

    if (!tickerid || !date || !open || !high || !low || !close || !volume) {
        res.status(400).send('All fields must be completed');
        return;
    }

    const insertQuery = 'INSERT INTO sustainablestocks.tickerdata (tickerid, date, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [tickerid, date, open, high, low, close, volume];

    pool.query(insertQuery , insertValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send('Ticker data inserted successfully');   
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});