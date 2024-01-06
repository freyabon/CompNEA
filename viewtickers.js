$(document).ready(function(){
    $('#myChart').hide();

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
                showTickerData(data);
            })
            .catch(error => console.error('Error:', error));
    });
});

function showTickers(data){
    $("#tblTickers").show();
    console.log(data);
    tickeritemhtml = "<tr><th>TickerID</th><th>Ticker Name</th><th>Continent</th><th>Save Ticker</th></tr>";
    data.forEach(item => {
        console.log(item);
        tickeritemhtml += '<tr><td>' + item.tickerid + '</td><td>' + item.tickername + '</td><td>' + item.continent + '</td><td><button><i class="fa-solid fa-heart"></i></button></td></tr>';
    });  
    $("#tblTickers").append(tickeritemhtml);         
}

function showTickerData(data){
    console.log(data);
    $('#divTickerSearch').hide();
    $("#tblTickers").hide();
    /*id = data[0];
    $("#tickerName").append(id);*/
}

