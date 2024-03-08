$(document).ready(function(){
    $('#divTickerData').hide();

    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    const tickerParam = urlParams.get('tickerid');   
    
    fetch(`http://localhost:2500/getTickerData?tickerid=${tickerParam}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showTickerData(data, tickerParam);
            })
            .catch(error => console.error('Error:', error));

    
    fetch(`http://localhost:2500/getSavedTickers?Username=${usernameParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(savedData => {
        const savedTickerList = savedData.map(ticker => ticker.tickerid);

        const isSaved = savedTickerList.includes(tickerParam);

        if(isSaved){
            tickeritemhtml = `<button id = "btnUnsave" class = "unsaveButton">Remove ticker</button>`;
        } else {
            tickeritemhtml = `<button id = "btnSave" class = "saveButton">Save ticker</button>`;
        }

        $("#saveBtn").append(tickeritemhtml);
    })
    .catch(error => console.error('Error:', error));

    /*$(document).on('click', '#saveGraph', function (e) {
        get();
    })*/

    $(document).on('click', '.saveButton', function (e) {
        $(this).hide();

        const savedTicker = {
            Username: usernameParam,
            tickerid: tickerParam
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

        $('#saveBtn').append('<button id = "btnUnsave" class = "unsaveButton">Remove ticker</button>');
    });

    $(document).on('click', '.unsaveButton', function (e) {
        $(this).hide();

        const unsaveTicker = {
            Username: usernameParam,
            tickerid: tickerParam
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

        $('#saveBtn').append('<button id = "btnSave" class = "saveButton">Save ticker</button>');
    });

    $(document).on('click', '#HomePage', function (e) {
        const queryString = `?username=${usernameParam}`;
        window.location.href = `home_page.html${queryString}`;
    });

    $(document).on('click', '#RegionPage', function (e) {
        const queryString = `?username=${usernameParam}`;
        window.location.href = `view_region.html${queryString}`;
    });

    $(document).on('click', '#NewsPage', function (e) {
        const queryString = `?username=${usernameParam}`;
        window.location.href = `ticker_news.html${queryString}`;
    });

    $(document).on('click', '#SavedPage', function (e) {
        const queryString = `?username=${usernameParam}`;
        window.location.href = `saved_tickers.html${queryString}`;
    });

    $(document).on('click', '#SignOut', function (e) {
        window.location.href = `index.html`;
    });
});

function displayTabular() {
    const isChecked = $('#tabularBox').prop('checked');
    
    if (isChecked) {
        $('#divTickerData').show();
        const urlParams = new URLSearchParams(window.location.search);
        const tickerParam = urlParams.get('tickerid');
        $("#tblTickerData").empty();

        fetch(`http://localhost:2500/getTickerData?tickerid=${tickerParam}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            let tickeritemhtml = "<tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume</th></tr>";
            data.forEach(item => {
                tickeritemhtml += `<tr><td>${item.date}</td><td>${item.open}</td><td>${item.high}</td><td>${item.low}</td><td>${item.close}</td><td>${item.volume}</td></tr>`;
            });
            $("#tblTickerData").append(tickeritemhtml);
        })
        .catch(error => console.error('Error:', error));
    } else {
        $('#divTickerData').hide();
    }
}
         
async function fetchData(ticker_id) {
    const ticker = ticker_id;
    const url = 'https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=' + ticker + '&outputsize=compact&datatype=json';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '07ac67f9bamsh510090a4ca23fb7p1590b4jsn5d3e7dd81289',
            'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        for (const date in result["Time Series (Daily)"]) {
            const openValue = result["Time Series (Daily)"][date]["1. open"];
            const highValue = result["Time Series (Daily)"][date]["2. high"];
            const lowValue = result["Time Series (Daily)"][date]["3. low"];
            const closeValue = result["Time Series (Daily)"][date]["4. close"];
            const volumeValue = result["Time Series (Daily)"][date]["5. volume"];
            console.log('Date: ' + date + ', Open: ' + openValue + ', High: ' + highValue + ', Low: ' + lowValue + ', Close: ' + closeValue + ', Volume: ' + volumeValue);
        
            const tickerData = {
                tickerid: ticker,
                date: date,
                open: openValue,
                high: highValue,
                low: lowValue,
                close: closeValue,
                volume: volumeValue
            };

            fetch('http://localhost:2500/updateTickerTable', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(tickerData),
             
          })

          .then(response => response.text())
          .then(data => {
              console.log(data);
          })
          .catch(error => console.error('Database error:', error));

        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchNews(ticker_id) {
    const ticker = ticker_id;
    const url = 'https://alpha-vantage.p.rapidapi.com/query?function=NEWS_SENTIMENT&symbols=' + ticker + '&limit=5&sort=RELEVANCE';
    //add filter for topics and limit once heard back from support
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '07ac67f9bamsh510090a4ca23fb7p1590b4jsn5d3e7dd81289',
            'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        tickerNewsHTML = "";

        for (const newsFeed of result["feed"]) {
            const title = newsFeed["title"];
            const url = newsFeed["url"];
            const summary = newsFeed["summary"];
            const bannerImage = newsFeed["banner_image"];
            const source = newsFeed["source"];
            //console.log('Title: ' + title + ', url: ' + url + ', Summary: ' + summary + ', Banner: ' + bannerImage + ', Source: ' + source);

            tickerNewsHTML += `<div class="storyBlock"><div class="imgContainer"><img src="${bannerImage}" alt="News story banner" class="bannerImg"></div><div class="textContainer"><div style="text-decoration: underline; text-decoration-color: green;">News Title: ${title}</div><div>Summary: ${summary}</div><a href="${url}" target="_blank">Read more...</a></div></div>`
        }
    } catch (error) {
        console.error(error);
    }
    $("#tickerNews").append(tickerNewsHTML);
}

async function showTickerData(data, tickerid){
    fetchData(tickerid);
    fetchNews(tickerid);

    let ctx = document.getElementById('myChart').getContext('2d');
    const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
    const closePrices = data.map(item => parseFloat(item.close));
    const lastDate = luxon.DateTime.fromISO(data[data.length - 1].date);

    const futureDates = [];
    for (let i = 1; i <= 30; i++) {
        const futureDate = lastDate.plus({days: i}).toFormat('dd/MM/yyyy');
        futureDates.push(futureDate);
    }

    const combinedDates = [...dates, ...futureDates];
    const objData = combinedDates.map((date, index) => ({
        date: date,
        close: index < dates.length ? closePrices[index] : null //for historical data, close is set to the corresponding close price but for future dates, close is set to null
    }));

    const csvData = convertToCSV({ dates, closePrices });

    function convertToCSV(data) {
        let csvContent = "Date,Close Price\n";
        for (let i = 0; i < data.dates.length; i++) {
            csvContent += `${data.dates[i]},${data.closePrices[i]}\n`;
        }
        return csvContent;
    }

    const download = function (data, tickerid) { 
        const blob = new Blob([data], { type: 'text/csv' }); 
        const url = window.URL.createObjectURL(blob); 
        const a = document.createElement('a') ;
        a.setAttribute('href', url) ;
        a.setAttribute('download', `${tickerid}_data.csv`);
        a.click();
    } 

    const downloadBtn = document.getElementById('saveGraph');
    downloadBtn.addEventListener('click', () => {
        download(csvData, tickerid);
    });

    let predictedValues = [];
    predictedValues = await runTF(objData);
    
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Close price',
                    data: closePrices,
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 25,
                    spanGaps: true
                },
                {
                    label: 'Predicted price',
                    data: predictedValues,
                    borderColor: 'orange',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 25,
                    spanGaps: true
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Historical and Predicted Stock Data For Close Prices',
                    font: {
                        size: 15
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            padding: 4,
                            size: 13, 
                            family: 'Arial'
                        },
                        color: 'green'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Close Prices (USD)',
                        font: {
                            size: 13,
                            family: 'Arial'
                        },
                        color: 'green'
                    },
                    beginAtZero: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Values',
                    }
                }
            }
        }
    });


    // tensorflow =====================================================================================================
    function extractData(obj) {
        const dateParts = obj.date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        const timestamp = new Date(year, month - 1, day).getTime()

        return { x: timestamp, y: parseFloat(obj.close) };
    }

    function removeErrors(obj) {
        return obj.x != null && obj.y != null;
    }

    async function runTF(data) {
        let values = data.map(extractData).filter(removeErrors);
        
        const surface1 = document.getElementById("plot1");
        const surface2 = document.getElementById("plot2");
        tfPlot(values, surface1);

        const inputs = values.map(obj => obj.x);
        const labels = values.map(obj => obj.y);
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
        const inputMin = inputTensor.min();  
        const inputMax = inputTensor.max();
        const labelMin = labelTensor.min();
        const labelMax = labelTensor.max();
        const nmInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const nmLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        const model = tf.sequential(); 
        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
        model.add(tf.layers.dense({units: 1, useBias: true}));
        model.compile({loss:'meanSquaredError', optimizer:'sgd'});

        await trainModel(model, nmInputs, nmLabels, surface2);

        let unX = tf.linspace(0, 1, 100);      
        let unY = model.predict(unX.reshape([100, 1]));      
        const unNormunX = unX
        .mul(inputMax.sub(inputMin))
        .add(inputMin);
        const unNormunY = unY
        .mul(labelMax.sub(labelMin))
        .add(labelMin);
        unX = unNormunX.dataSync();
        unY = unNormunY.dataSync();

        const predicted = Array.from(unX).map((val, i) => {
        return {x: val, y: unY[i]}
        });
        predictedValues = predicted.map(item => item.y);
        tfPlot([values,predicted], surface1)
        return predictedValues;
    }

    function tfPlot(values, surface) {
        tfvis.render.scatterplot(surface,
          {values:values, series:['Original','Predicted']},
          {xLabel:'Dates', yLabel:'Close Prices',});
    }

    async function trainModel(model, inputs, labels, surface) {
        const batchSize = 25;
        const epochs = 50;
        const callbacks = tfvis.show.fitCallbacks(surface, ['loss'], {callbacks:['onEpochEnd']})
        return await model.fit(inputs, labels,
          {batchSize, epochs, shuffle:true, callbacks:callbacks}
        );
    }

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
