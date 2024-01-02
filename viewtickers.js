$(document).ready(function(){
    $('#btnTickers').on('click', function (e) {
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
    });
});

function showTickers(data){
    console.log(data);
    tickeritemhtml = "<tr><td>TickerID</td><td>Ticker Name</td></tr>";
    data.forEach(item => {
        console.log(item);
        tickeritemhtml += "<tr><td>" + item.tickerid + "</td><td>" + item.tickername + "</td></tr>";
    });  
    $("#tblTickers").append(tickeritemhtml);          
}