$(document).ready(function(){
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');

    fetchNews();

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

async function fetchNews() {
    const url = 'https://alpha-vantage.p.rapidapi.com/query?function=NEWS_SENTIMENT&limit=5&sort=RELEVANCE';
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