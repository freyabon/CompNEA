$(document).ready(function(){
    $('#myChart').hide();
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
                showTickers(data);
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
        saved.append("Saved");

    });
});

function displayUsername(username) {
    console.log(username);
    welcome = 'Welcome ' + username;
    $('#userDiv').append(welcome);
}

function showTickers(data){
    $("#tblTickers").show();
    console.log(data);
    tickeritemhtml = "<tr><th>TickerID</th><th>Ticker Name</th><th>Continent</th><th>Save Ticker</th></tr>";
    data.forEach(item => {
        console.log(item);
        tickeritemhtml += '<tr><td>' + item.tickerid + '</td><td>' + item.tickername + '</td><td>' + item.continent + '</td><td><button id = "btnSave" class = "saveButton">Save</button></td></tr>';
    });  
    $("#tblTickers").append(tickeritemhtml);         
}

function showTickerData(data, tickerid){
    console.log(data);
    $('#divTickerSearch').hide();
    $("#tblTickers").hide();
    $('#myChart').show();

    $("#tickerName").append(tickerid);

    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart(data, tickerid));
}

function drawChart(chartData, tickerid) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('date', 'Date');
    dataTable.addColumn('number', 'Close price');
    dataTable.addColumn('number', 'Prediction');

    chartData.forEach(item => {
        console.log(item);
        dataTable.addRows([item.date, item.close]);
    });

    var options = {
    chart: {
        title: 'Close prices for ticker: ' + tickerid,
        subtitle: 'in dollars (USD)'
    },
    width: 900,
    height: 500
    };

    var chart = new google.charts.Line(document.getElementById('myChart'));

    chart.draw(dataTable, google.charts.Line.convertOptions(options));
}
