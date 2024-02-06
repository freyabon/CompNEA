const { restClient } = require('@polygon.io/client-js');
const rest = restClient("ralyCeEeyZU2cnXhv5I4yDPOwdSjUsR0");

$('#callAPI').on('click', function () {
    rest.stocks.aggregates("AAPL", 1, "day", "2023-01-01", "2019-04-14").then((data) => {
        console.log(data);
    }).catch(e => {
        console.error('An error happened:', e);
    });
});


