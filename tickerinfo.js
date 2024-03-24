$(document).ready(function(){
    $('#divTickerData').hide();
    $("#displayRMSE").hide();

    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    const tickerParam = urlParams.get('tickerid');   
    
    $("#tickerName").append(tickerParam);
    tickerinfohtml = '';
    fetch(`http://localhost:2500/getTickerInfo?tickerid=${tickerParam}`, {
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
            
    fetchAndShowData(tickerParam);

    $(document).on('change', '#openBox, #highBox, #lowBox, #closeBox, #volumeBox', function() {
        if ($(this).prop('checked')) {
            $('#openBox, #highBox, #lowBox, #closeBox, #volumeBox').not(this).prop('checked', false);
        }
        fetchAndShowData(tickerParam);
        console.log('function called')
    });


    $(document).on('change', '#predictionBox, #SMABox', function() {
        $("#selectDataDiv").hide();

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
    });

    
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
                tickeritemhtml += `<tr><td>${luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy')}</td><td>${item.open}</td><td>${item.high}</td><td>${item.low}</td><td>${item.close}</td><td>${item.volume}</td></tr>`;
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
            
            tickerNewsHTML += `<div class="storyBlock"><div class="imgContainer"><img src="${bannerImage}" alt="News story banner" class="bannerImg"></div><div class="textContainer"><div style="text-decoration: underline; text-decoration-color: green;">News Title: ${title}</div><div>Summary: ${summary}</div><a href="${url}" target="_blank">Read more...</a></div></div>`
        }
    } catch (error) {
        console.error(error);
    }
    $("#tickerNews").append(tickerNewsHTML);
}

async function fetchAndShowData(tickerParam) {
    const response = await fetch(`http://localhost:2500/getTickerData?tickerid=${tickerParam}`);
    const data = await response.json();
    showTickerData(data, tickerParam);
}

let myChart;

async function showTickerData(data, tickerid){
    fetchData(tickerid);
    fetchNews(tickerid);
    
    const isOpenChecked = $('#openBox').prop('checked');
    const isHighChecked = $('#highBox').prop('checked');
    const isLowChecked = $('#lowBox').prop('checked');
    const isCloseChecked = $('#closeBox').prop('checked');
    const isVolumeChecked = $('#volumeBox').prop('checked'); 
    const isPredChecked = $('#predictionBox').prop('checked');
    const isSMAChecked = $('#SMABox').prop('checked');

    const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
    const lastDate = luxon.DateTime.fromISO(data[data.length - 1].date);

    const futureDates = [];
    for (let i = 1; i <= 30; i++) {
        const futureDate = lastDate.plus({days: i}).toFormat('dd/MM/yyyy');
        futureDates.push(futureDate);
    }
    const combinedDates = [...dates, ...futureDates];

    function convertToCSV(data) {
        const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
        const openPrices = data.map(item => parseFloat(item.open));
        const highPrices = data.map(item => parseFloat(item.high));
        const lowPrices = data.map(item => parseFloat(item.low));
        const closePrices = data.map(item => parseFloat(item.close));
        const volume = data.map(item => parseFloat(item.volume));
        let csvContent = "Date,Open,High,Low,Close,Volume\n";
        for (let i = 0; i < dates.length; i++) {
            csvContent += `${dates[i]},${openPrices[i]},${highPrices[i]},${lowPrices[i]},${closePrices[i]},${volume[i]}\n`;
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

    const csvData = convertToCSV(data);
    const downloadBtn = document.getElementById('saveGraph');
    downloadBtn.addEventListener('click', () => {
        download(csvData, tickerid);
    });

    const windowSize = 10; //number of data points used to calculate the average
    let datasets = [];

    if (isOpenChecked) {
        const openPrices = data.map(item => parseFloat(item.open));
        datasets.push({
            label: 'Open',
            data: openPrices,
            borderColor: 'green',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 25,
            spanGaps: true
        });
        const smaValuesOpen = computeSMA(dates, openPrices, windowSize);
        if (isPredChecked){
            let predictedValuesOpen = [];
            predictedValuesOpen = await runTF(smaValuesOpen);
            datasets.push({
                label: 'Predicted Open',
                data: predictedValuesOpen,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (isSMAChecked) {
            datasets.push({
                label: 'SMA Open',
                data: smaValuesOpen.map(item => item.data),
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
    }

    if (isHighChecked) {
        const highPrices = data.map(item => parseFloat(item.high));
        datasets.push({
            label: 'High',
            data: highPrices,
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 25,
            spanGaps: true
        });
        const smaValuesHigh = computeSMA(dates, highPrices, windowSize);
        if (isPredChecked){
            let predictedValuesHigh = [];
            predictedValuesHigh = await runTF(smaValuesHigh);
            datasets.push({
                label: 'Predicted High',
                data: predictedValuesHigh,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (isSMAChecked) {
            datasets.push({
                label: 'SMA High',
                data: smaValuesHigh.map(item => item.data),
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
    }

    if (isLowChecked) {
        const lowPrices = data.map(item => parseFloat(item.low));
        datasets.push({
            label: 'Low',
            data: lowPrices,
            borderColor: 'purple',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 25,
            spanGaps: true
        });
        const smaValuesLow = computeSMA(dates, lowPrices, windowSize);
        if (isPredChecked){
            let predictedValuesLow = [];
            predictedValuesLow = await runTF(smaValuesLow);
            datasets.push({
                label: 'Predicted Low',
                data: predictedValuesLow,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (isSMAChecked) {
            datasets.push({
                label: 'SMA Low',
                data: smaValuesLow.map(item => item.data),
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
    }

    if (isCloseChecked) {
        const closePrices = data.map(item => parseFloat(item.close));
        datasets.push({
            label: 'Close',
            data: closePrices,
            borderColor: 'pink',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 25,
            spanGaps: true
        });
        const smaValuesClose = computeSMA(dates, closePrices, windowSize);
        if (isPredChecked){
            let predictedValuesClose = [];
            predictedValuesClose = await runTF(smaValuesClose);
            datasets.push({
                label: 'Predicted Close',
                data: predictedValuesClose,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (isSMAChecked) {
            datasets.push({
                label: 'SMA Close',
                data: smaValuesClose.map(item => item.data),
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
    }

    if(!isVolumeChecked){
        updateChart(datasets, combinedDates);
    } else {
        const volume = data.map(item => parseFloat(item.volume));
        let volumeDatasets = [];
        volumeDatasets.push({
            label: 'Volume (units)',
            data: volume,
            borderColor: 'black',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 25,
            spanGaps: true
        });
        const smaValuesVolume = computeSMA(dates, volume, windowSize);
        if (isPredChecked){
            let predictedValuesVolume = [];
            predictedValuesVolume = await runTF(smaValuesVolume);
            volumeDatasets.push({
                label: 'Predicted Volume',
                data: predictedValuesVolume,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (isSMAChecked) {
            volumeDatasets.push({
                label: 'SMA Volume',
                data: smaValuesVolume.map(item => item.data),
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 25,
                spanGaps: true
            });
        }
        if (myChart instanceof Chart) {
            myChart.destroy();
        }
        let ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: combinedDates,
                datasets: volumeDatasets
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Stock Data',
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
                            text: 'Volume (units)',
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
    }
    

    // tensorflow =====================================================================================================
    function extractData(obj) {
        const dateParts = obj.date.split('/');
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        const timestamp = new Date(year, month - 1, day).getTime()

        return { x: timestamp, y: parseFloat(obj.data) };
    }
    

    function removeErrors(obj) {
        return obj && typeof obj.x !== 'undefined' && obj.y !== null;
    }    

    async function runTF(stockData) {
        let values = stockData.map(extractData).filter(removeErrors);
        const surface2 = document.getElementById("plot2");

        const historicalInputs = values.map(obj => obj.x);
        const historicalLabels = values.map(obj => obj.y);
        const inputTensor = tf.tensor2d(historicalInputs, [historicalInputs.length, 1]);
        const labelTensor = tf.tensor2d(historicalLabels, [historicalLabels.length, 1]);
        const inputMin = inputTensor.min();  
        const inputMax = inputTensor.max();
        const labelMin = labelTensor.min();
        const labelMax = labelTensor.max();
        const nmInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const nmLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        $('#displayRMSE').empty();
        $("#displayRMSE").show();
        const mseTensor = tf.metrics.meanSquaredError(nmInputs, nmLabels);
        const mseValue = mseTensor.dataSync()[0];
        const htmlrmse = 'Root Mean Squared Error: ' + Math.sqrt(mseValue).toFixed(4);
        $('#displayRMSE').append(htmlrmse);

        const model = tf.sequential(); 
        model.add(tf.layers.dense({inputShape: [1], units: 64, activation: 'relu'}));
        model.add(tf.layers.dense({units: 1, activation: 'linear'}));
        model.compile({loss:'meanSquaredError', optimizer: tf.train.adam(0.01)});

        await trainModel(model, nmInputs, nmLabels, surface2);

        const futureDates = [];
        const lastTimestamp = historicalInputs[historicalInputs.length - 1];
        for (let i = 1; i <= 30; i++){
            const futureDate = lastTimestamp + (i*24*3600*1000)//timestamp is in milliseconds
            futureDates.push(futureDate);
        }
        const combinedDates = [...historicalInputs, ...futureDates];
        const combinedMin = Math.min(...combinedDates);  
        const combinedMax = Math.max(...combinedDates);  
        const nmcombinedDates = combinedDates.map(date => (date - combinedMin) / (combinedMax - combinedMin));
        
        let nmcombinedDatesTensor = tf.tensor2d(nmcombinedDates, [nmcombinedDates.length, 1]);
        let unX = tf.concat([nmInputs, nmcombinedDatesTensor], 0);
        let unY = model.predict(unX);   
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
        return predictedValues;
    }

    async function trainModel(model, inputs, labels, surface) {
        const batchSize = 35;
        const epochs = 100;
        const callbacks = tfvis.show.fitCallbacks(surface, ['loss'], {callbacks:['onEpochEnd']})
        return await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true
        });
    }
}

function computeSMA(dates, stockData, windowSize){
    const smaValues = [];
    for (let i = windowSize - 1; i < stockData.length; i++){
        let sum = 0;
        for(let j = i - windowSize + 1; j <= i; j++){
            sum += parseFloat(stockData[j]);
        }
        const average = sum / windowSize;
        smaValues.push({date: dates[i], data: average});
    }
    return smaValues;
}

function updateChart(datasets, dates) {
    if (myChart instanceof Chart) {
        myChart.destroy();
    }
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Data',
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
                        text: 'Price (USD)',
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
}