$(document).ready(function(){
    $('#historicalDataGraph').hide();
    $('#tickerInfo').hide();
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    
    if (usernameParam) {
        displayUsername(usernameParam);
    }

    fetch(`http://localhost:2500/getTickerList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showTickers(data, usernameParam);
            })
            .catch(error => console.error('Error:', error));


    $('#btnSearch').on('click', function (e) {
        var tickerid = $('#TickerSymbol').val();

        fetch(`http://localhost:2500/getTickerData?tickerid=${tickerid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showTickerData(data, tickerid);
            })
            .catch(error => console.error('Error:', error));
    });

    $(document).on('click', '.saveButton', function (e) {
        const row = $(this).closest('tr');
        const tickerid = row.find('td:first').text();
        const continent = row.find('td:nth-child(3)').text();
        const saved = $(this).closest('td');
        console.log(`Saved TickerID: ${tickerid}, Continent: ${continent}`);
        
        $(this).hide();

        const savedTicker = {
            Username: usernameParam,
            tickerid: tickerid
        };
    
        fetch('http://localhost:2500/saveTicker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(savedTicker),
           
        })
       
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Database error:', error));

        saved.append('<button id = "btnUnsave" class = "unsaveButton">Unsave</button>');
    });

    $(document).on('click', '.unsaveButton', function (e) {
        const row = $(this).closest('tr');
        const tickerid = row.find('td:first').text();
        const continent = row.find('td:nth-child(3)').text();
        const saved = $(this).closest('td');
        console.log(`Unsaved TickerID: ${tickerid}, Continent: ${continent}`);
        
        $(this).hide();

        const unsaveTicker = {
            Username: usernameParam,
            tickerid: tickerid
        };
    
        fetch('http://localhost:2500/unsaveTicker', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unsaveTicker),
           
        })
       
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Database error:', error));

        saved.append('<button id = "btnSave" class = "saveButton">Save</button>');
    });
});

function displayUsername(username) {
    console.log(username);
    welcome = 'Welcome to SustainableStocks ' + username + '!';
    $('#userDiv').append(welcome);
}

function showTickers(data, username){
    $("#tblTickers").show();
    console.log(data);
    tickeritemhtml = "<tr><th>TickerID</th><th>Ticker Name</th><th>Continent</th><th>Save Ticker</th></tr>";

    fetch(`http://localhost:2500/getSavedTickers?Username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(savedData => {
        const savedTickerList = savedData.map(ticker => ticker.tickerid);

        data.forEach(item => {
            console.log(item);
            const isSaved = savedTickerList.includes(item.tickerid);

            tickeritemhtml += `<tr><td>${item.tickerid}</td><td>${item.tickername}</td><td>${item.continent}</td><td>${isSaved ? '<button class="unsaveButton">Unsave</button>' : '<button class="saveButton">Save</button>'}</td></tr>`;
        });

        $("#tblTickers").append(tickeritemhtml);
    })
    .catch(error => console.error('Error:', error));
}         

function showTickerData(data, tickerid){
    $('#divTickerSearch').hide();
    $("#tblTickers").hide();
    $('#userDiv').hide();
    $('#historicalDataGraph').show();
    $('#tickerInfo').show();

    function tfPlot(values, surface) {
        tfvis.render.linechart(surface,
            { values: values, series: ['Original', 'Predicted'] },
            { xLabel: 'Date', yLabel: 'Close Price' }
        );
    }

    async function runTF(data) {
        const dates = data.map(item => new Date(item.date));
        const closePrices = data.map(item => parseFloat(item.close));
        const values = dates.map((date, index) => ({ x: date, y: closePrices[index] }));

        // Plot historical data
        const surface1 = document.getElementById("historicalDataGraph");
        tfvis.render.linechart(surface1,
            { values: values, series: ['Original'] },
            { xLabel: 'Date', yLabel: 'Close Price' }
        );

        tf.util.shuffle(values);

        // Create Tensors using the inputs and normalise data
        const inputs = dates.map(date => date.getTime()); // converted time to milliseconds in order to fit model
        const labels = closePrices;
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
        const inputMin = inputTensor.min();
        const inputMax = inputTensor.max();
        const labelMin = labelTensor.min();
        const labelMax = labelTensor.max();
        const normInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        //TensorFlow model
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));
        model.add(tf.layers.dense({ units: 1, useBias: true }));
        model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

        // Start training
        const surface2 = document.getElementById("epochGraph");
        await trainModel(model, normInputs, normLabels, surface2);

        // Un-normalising and predicting
        const unNormInputs = tf.linspace(inputMin, inputMax, 100);
        const unNormOutputs = model.predict(unNormInputs.reshape([100, 1]));
        const unNormInputValues = unNormInputs.dataSync();
        const unNormOutputValues = unNormOutputs.dataSync();
        const predicted = Array.from(unNormInputValues).map((value, index) => ({ x: new Date(value), y: unNormOutputValues[index] }));

        tfPlot([values, predicted], surface1);
    }

    async function trainModel(model, inputs, labels, surface) {
        const batchSize = 10;
        const epochs = 50;
        const callbacks = tfvis.show.fitCallbacks(surface, ['loss'], { callbacks: ['onEpochEnd'] });
        return await model.fit(inputs, labels, { batchSize, epochs, shuffle: true, callbacks: callbacks });
    }

    runTF(data);

    $("#tickerName").append(tickerid);
    tickerinfohtml = '';

    fetch(`http://localhost:2500/getTickerInfo?tickerid=${tickerid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                info = data[0];
                tickerinfohtml += `<div>Company Name: ${info.tickername}</div><div>Where: ${info.continent}</div><div>Energy Source(s): `;
                data.forEach(item => {
                    tickerinfohtml += `<div>- ${item.energysource}</div></div>`;
                });
                $('#tickerInfoStats').append(tickerinfohtml);
            })
            .catch(error => console.error('Error:', error));
    

}
