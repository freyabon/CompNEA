$(document).ready(function(){
    $('#historicalDataGraph').hide();
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
    const dates = data.map(item => new Date(item.date));
    const closePrices = data.map(item => parseFloat(item.close));

    $('#divTickerSearch').hide();
    $("#tblTickers").hide();
    $('#userDiv').hide();
    $('#historicalDataGraph').show(); 
    const surface = document.getElementById('historicalDataGraph');

    const values = dates.map((date, index) => ({ x: date, y: closePrices[index] }));

    const options = {
        xLabel: 'Date',
        yLabel: 'Close Price (USD)',
        title: `Historical Data for ${tickerid}`,
        seriesColors: ['green'],
        seriesLabel: ['Close Price'],
        xAxisDomain: dates,
        yAxisDomain: [Math.min(...closePrices), Math.max(...closePrices)]
    };

    tfvis.render.linechart(surface, { values }, options);

    $("#tickerName").append(tickerid);
}
