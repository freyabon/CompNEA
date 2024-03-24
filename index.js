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

'use strict';
let crypto = require('crypto');
const { log } = require('console');
let logger = func => {
    console.log(func);
};

let generateSalt = rounds => {
    if (rounds >= 15){
        throw new Error('${rounds} is greater than 15, must be less than 15');
    }
    if (typeof rounds !== 'number') {
        throw new Error('rounds para, must be a number');
    }
    if (rounds == null) {
        rounds = 12;
    }
    return crypto.randomBytes(Math.ceil(rounds/2)).toString('hex').slice(0, rounds);
};

let hasher = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value =  hash.digest('hex');
    return {
        salt: salt,
        hashedpassword: value
    };
};

let hash = (password, salt) => {
    if (password == null || salt == null) {
        throw new Error('Provide Password and salt values');
    }
    if (typeof password !== 'string' || typeof salt !== 'string') {
        throw new Error('password must be a string and salt must either be a salt string or a number of rounds');
    }
    return hasher(password, salt);
};

let compare = (password, retrievedPassword) => {
    if (password == null || retrievedPassword == null) {
        throw new Error('password and hash is required to compare');
    }
    if (typeof password !== 'string' || typeof retrievedPassword !== 'object') {
        throw new Error('password must be a String and hash must be an Object');
    }
    let passwordData = hasher(password, retrievedPassword.salt);
    if (passwordData.hashedpassword === retrievedPassword.hashedpassword) {
        return true;
    }
    return false
};


app.get('/getUserDetails', (req, res) => {
    const { Username, Password } = req.query;
    console.log(req.query)

    if (!Username) {
        res.status(400).send('Username must be provided');
        return;
    }

    const SelectQuery = 'SELECT salt, hashedPassword FROM sustainablestocks.hasheduserdetails WHERE Username = ?';
    const SelectValues = [Username];

    pool.query(SelectQuery , SelectValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length === 0){
            res.status(404).send('User was not found');
            return;
        }
        const {salt, hashedPassword} = results[0];
        const match = compare(Password, {salt, hashedpassword: hashedPassword});

        if (match) {
            res.json(results);
        } else {
            res.status(401).send('Incorrect password');
        }
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

    const trimmedTicker = tickerid.trim();
    const sanitisedTicker = removeSpecialCharacters(trimmedTicker);

    const SelectQuery = 'SELECT * FROM sustainablestocks.tickerdata WHERE tickerid = ?';
    const SelectValues = [sanitisedTicker];

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

app.get('/getRegionTicker', (req, res) => {
    const SelectQuery = 'SELECT tickerid,  continent, coordinates FROM sustainablestocks.tickerlist JOIN sustainablestocks.region ON sustainablestocks.tickerlist.regionid = sustainablestocks.region.regionid';
    
    pool.query(SelectQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getEnergyTicker', (req, res) => {
    const SelectQuery = 'SELECT tickerid,  energysource FROM sustainablestocks.energytickertbl JOIN sustainablestocks.energylist ON sustainablestocks.energytickertbl.energyid = sustainablestocks.energylist.energyid';
    
    pool.query(SelectQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getRegionList', (req, res) => {
    const SelectQuery = 'SELECT continent FROM sustainablestocks.region';
    
    pool.query(SelectQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getTickerContinent', (req, res) => {
    const { continent } = req.query;

    if (!continent) {
        res.status(400).send('Continent must be provided');
        return;
    }

    const SelectQuery = 'SELECT tickerid FROM sustainablestocks.tickerlist JOIN sustainablestocks.region ON sustainablestocks.tickerlist.regionid = sustainablestocks.region.regionid WHERE continent = ?';
    const SelectValues = [continent];

    pool.query(SelectQuery, SelectValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getTickerEnergy', (req, res) => {
    const { energysource } = req.query;

    if (!energysource) {
        res.status(400).send('Energy source must be provided');
        return;
    }

    const SelectQuery = 'SELECT tickerid FROM sustainablestocks.energytickertbl JOIN sustainablestocks.energylist ON sustainablestocks.energytickertbl.energyid = sustainablestocks.energylist.energyid WHERE energysource = ?';
    const SelectValues = [energysource];

    pool.query(SelectQuery, SelectValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getEnergyList', (req, res) => {
    const SelectQuery = 'SELECT energysource FROM sustainablestocks.energylist';
    
    pool.query(SelectQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results) 
    });
});

app.get('/getTickerInfo', (req, res) => {
    const { tickerid } = req.query;

    if (!tickerid) {
        res.status(400).send('TickerID must be provided');
        return;
    }
    const SelectQuery = 'SELECT tickername, energysource, continent FROM sustainablestocks.tickerlist JOIN sustainablestocks.energytickertbl ON tickerlist.tickerid = energytickertbl.tickerid JOIN sustainablestocks.energylist ON energytickertbl.energyid = energylist.energyid JOIN sustainablestocks.region ON tickerlist.regionid = region.regionid WHERE sustainablestocks.tickerlist.tickerid = ?';
    const SelectValues = [tickerid];

    pool.query(SelectQuery, SelectValues, (err, results) => {
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

    if (!Username || !Password) {
        res.status(400).send('All fields must be completed');
        return;
    }

    const trimmedUsername = Username.trim();
    const trimmedPassword = Password.trim();

    const sanitisedUsername = removeSpecialCharacters(trimmedUsername);
    const sanitisedPassword = removeSpecialCharacters(trimmedPassword);

    const checkExistQuery = 'SELECT COUNT(*) AS count FROM sustainablestocks.hasheduserdetails WHERE Username = ?';
    const checkExistValues = [sanitisedUsername];

    pool.query(checkExistQuery, checkExistValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const countUsername = results[0].count;
        console.log(countUsername);
        if (countUsername === 0) {
            let salt = generateSalt(10);
            let hashedPassword = hash(sanitisedPassword, salt);

            const RegisterQuery = 'INSERT INTO sustainablestocks.hasheduserdetails (Username, salt, hashedPassword) VALUES (?, ?, ?)';
            const RegisterValues = [sanitisedUsername, hashedPassword.salt, hashedPassword.hashedpassword];

            pool.query(RegisterQuery, RegisterValues, (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.status(200).send('User registered successfully');
            });
        } else {
            res.status(401).send('User already exists');
        }
    });
});


function removeSpecialCharacters(input){
    const removedInput = input.replace(/'/g, "''");
    return removedInput;
}

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

    const insertQuery = 'INSERT INTO sustainablestocks.tickerdata (tickerid, date, open, high, low, close, volume) SELECT ?, ?, ?, ?, ?, ?, ? FROM dual WHERE NOT EXISTS (SELECT 1 FROM sustainablestocks.tickerdata WHERE tickerid = ? AND date = ?)';
    const insertValues = [tickerid, date, open, high, low, close, volume, tickerid, date];


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