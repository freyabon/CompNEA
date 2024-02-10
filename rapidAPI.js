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

$('#btnTickerID').on('click', function () {
    ticker_id=$('#inpTickerID')[0].value;
    fetchData(ticker_id);
});

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
            console.log('Title: ' + title + ', url: ' + url + ', Summary: ' + summary + ', Banner: ' + bannerImage + ', Source: ' + source);

            tickerNewsHTML += `<div class="storyBlock"><div class="imgContainer"><img src="${bannerImage}" alt="News story banner" class="bannerImg"></div><div class="textContainer"><div style="text-decoration: underline; text-decoration-color: green;">News Title: ${title}</div><div>Summary: ${summary}</div><a href="${url}" target="_blank">Read more...</a></div></div>`
        }
    } catch (error) {
        console.error(error);
    }
    $("#tickerNews").append(tickerNewsHTML);
}

$('#btnFetchNews').on('click', function () {
    ticker_id=$('#inpTickerNews')[0].value;
    fetchNews(ticker_id);
});

/*
        <div id="blockCallStockAPI" class="w3-card-4">
            <div class="w3-container w3-green">
              <h2>Call API</h2>
            </div class="w3-container">
            <p>      
            <label class="w3-text-green"><b>Enter TickerID</b></label>
            <input id="inpTickerID" class="w3-input w3-border w3-sand" name="inp_ticker" type="text"></p>
            <p>
            <button id="btnTickerID" class="w3-btn w3-green">Call</button></p>
        </div>

        <div id="blockCallStockAPI" class="w3-card-4">
            <div class="w3-container w3-green">
              <h2>Fetch News</h2>
            </div class="w3-container">
            <p>      
            <label class="w3-text-green"><b>Enter TickerID</b></label>
            <input id="inpTickerNews" class="w3-input w3-border w3-sand" name="inp_ticker" type="text"></p>
            <p>
            <button id="btnFetchNews" class="w3-btn w3-green">Fetch</button></p>
        </div>

        <div id="tickerNews"></div>
*/