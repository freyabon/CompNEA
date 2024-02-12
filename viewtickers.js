$(document).ready(function(){
    $('#historicalDataGraph').hide();
    $('#tickerInfo').hide();
    $('#tickerContainerDiv').hide();
    $('#refreshBtn').hide();
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');       

    if (usernameParam) {
        displayUsername(usernameParam);
    }

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


    $(document).on('click', '#HomePage', function (e) {
        const queryString = `?username=${usernameParam}`;
        window.location.href = `ticker_info.html${queryString}`;
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

function displayUsername(username) {
    console.log(username);
    welcome = 'Welcome to SustainableStocks ' + username;
    $('#userDiv').append(welcome);
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
    $('#divTickerSearch').hide();
    $("#tblTickers").hide();
    $('#userDiv').hide();
    $('#historicalDataGraph').show();
    $('#tickerInfo').show();
    $('#tickerContainerDiv').show();
    $('#refreshBtn').show();
    $('#divBackImg').hide();
    
    fetchData(tickerid);
    console.log('data fetched hopefully');

    fetchNews(tickerid);


    let ctx = document.getElementById('myChart').getContext('2d');
    const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
    const closePrices = data.map(item => parseFloat(item.close));
    
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Close prices',
                    data: closePrices,
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: true,
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
                    text: 'Historical Stock Data For Close Prices',
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
                    beginAtZero: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Values',
                    }
                }
            }
        }
    });

    const containerBody = document.querySelector('.containerBody');
    if(myChart.data.labels.length > 15){
        containerBody.style.width = '800px';
    }

    const dataLength = data.length;
    const containerWidth = 30 * dataLength + 'px';
    $('.chartContainer').css('width', containerWidth);

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
        
        // Plot the Data
        const surface1 = document.getElementById("plot1");
        const surface2 = document.getElementById("plot2");
        tfPlot(values, surface1);

        // Convert Input to Tensors
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

        // Create a Tensorflow Model
        const model = tf.sequential(); 
        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
        model.add(tf.layers.dense({units: 1, useBias: true}));
        model.compile({loss:'meanSquaredError', optimizer:'sgd'});

        // Start Training
        await trainModel(model, nmInputs, nmLabels, surface2);

        // Un-Normalize Data
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

        // Test the Model
        const predicted = Array.from(unX).map((val, i) => {
        return {x: val, y: unY[i]}
        });
        tfPlot([values,predicted], surface1)
    }

    function tfPlot(values, surface) {
        tfvis.render.scatterplot(surface,
          {values:values, series:['Original','Predicted']},
          {xLabel:'Dates', yLabel:'Close Prices',});
    }

    /*function tfPlot(values, surface, data) {
        const predictedData = values.map(item => ({ x: item.x, y: item.y }));
        const originalDates = predictedData.map(item => plotDateFormat(item.x));
        const predictedValues = predictedData.map(item => item.y);

        let ctx2 = document.getElementById('plot1').getContext('2d');
        //const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
        const closePrices = data.map(item => parseFloat(item.close));
        
        let myChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: originalDates,
                datasets: [
                    {
                        label: 'Close prices',
                        data: closePrices,
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 25,
                        spanGaps: true
                    },
                    {
                        label: 'Predicted prices',
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
                        text: 'Historical/Prediction Stock Data For Close Prices',
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
                        beginAtZero: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Values',
                        }
                    }
                }
            }
        });
    }*/

    async function trainModel(model, inputs, labels, surface) {
        const batchSize = 25;
        const epochs = 50;
        const callbacks = tfvis.show.fitCallbacks(surface, ['loss'], {callbacks:['onEpochEnd']})
        return await model.fit(inputs, labels,
          {batchSize, epochs, shuffle:true, callbacks:callbacks}
        );
    }

    function plotDateFormat(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    runTF(data);


    //const dates = data.map(item => new Date(item.date));
    //const dates = data.map(item => luxon.DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'));
    //const closePrices = data.map(item => parseFloat(item.close));

    /*function createModel() {
        // Create a sequential model
        const model = tf.sequential();
        // Add a single input layer
        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));   
        // Add an output layer
        model.add(tf.layers.dense({units: 1, useBias: true}));
        return model;
    }

    const model = createModel();
    tfvis.show.modelSummary({name: 'Model Summary'}, model);

    // Convert the data to a form we can use for training.
    const tensorData = convertToTensor(data);
    const {inputs, labels} = tensorData;

    // Train the model
    await trainModel(model, inputs, labels);
    console.log('Done Training');

    testModel(model, data, tensorData);

    function convertToTensor(data) {
        // Wrapping these calculations in a tidy will dispose any
        // intermediate tensors.
      
        return tf.tidy(() => {
          // Step 1. Shuffle the data
          tf.util.shuffle(data);
      
          // Step 2. Convert data to Tensor
          const inputs = data.map(d => d.horsepower)
          const labels = data.map(d => d.mpg);
      
          const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
          const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
      
          //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
          const inputMax = inputTensor.max();
          const inputMin = inputTensor.min();
          const labelMax = labelTensor.max();
          const labelMin = labelTensor.min();
      
          const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
          const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
      
          return {
            inputs: normalizedInputs,
            labels: normalizedLabels,
            // Return the min/max bounds so we can use them later.
            inputMax,
            inputMin,
            labelMax,
            labelMin,
          }
        });
    }

    async function trainModel(model, inputs, labels) {
        model.compile({
          optimizer: tf.train.adam(),
          loss: tf.losses.meanSquaredError,
          metrics: ['mse'],
        });
      
        const batchSize = 32;
        const epochs = 50;
      
        return await model.fit(inputs, labels, {
          batchSize,
          epochs,
          shuffle: true,
          callbacks: tfvis.show.fitCallbacks(
            { name: 'Training Performance' },
            ['loss', 'mse'],
            { height: 200, callbacks: ['onEpochEnd'] }
          )
        });
    }

    function testModel(model, inputData, normalizationData) {
        const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

        const [inputs, labels] = tf.tidy(() => {
            const xs = tf.linspace(0, 1, inputData.length);
            const preds = model.predict(xs.reshape([inputData.length, 1]));
    
            const unNormInputs = xs.mul(inputMax.sub(inputMin)).add(inputMin);
            const unNormLabels = preds.mul(labelMax.sub(labelMin)).add(labelMin);
    
            return [unNormInputs.dataSync(), unNormLabels.dataSync()];
        });
    
        const predictedPoints = Array.from(inputs).map((val, i) => {
            return {x: val, y: labels[i]}
        });
    
        const ctx2 = document.getElementById('myChart2').getContext('2d');
    
        let myChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: inputData.map(d => d.date),
                datasets: [
                    {
                        label: 'Close prices',
                        data: inputData.map(d => d.close),
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        spanGaps: true
                    },
                    {
                        label: 'Predicted Close Prices',
                        data: predictedPoints,
                        borderColor: 'orange',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5,
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
                        text: 'Historical Stock Data For Close Prices',
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
                        beginAtZero: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Values',
                        }
                    }
                }
            }
        });
    }*/
    


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
