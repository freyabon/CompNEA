$(document).ready(function(){
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');       

    if (usernameParam) {
        displayUsername(usernameParam);
    }

    fetch(`http://localhost:2500/getRegionList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showRegions(data);
            })
            .catch(error => console.error('Error:', error));

        fetch(`http://localhost:2500/getEnergyList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showEnergySources(data);
            })
            .catch(error => console.error('Error:', error));

    $('#btnSearch').on('click', function (e) {
        var tickerid = $('#TickerSymbol').val();

        const queryTicker = `?tickerid=${tickerid}&username=${usernameParam}`;
        window.location.href = `ticker_info.html${queryTicker}`;
        showTickerData(data, tickerid);
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

function displayUsername(username) {
    console.log(username);
    welcome = 'Welcome to SustainableStocks ' + username;
    $('#userDiv').append(welcome);
}

function showRegions(data){
    google.charts.load('current', {
        'packages': ['map'],
        'mapsApiKey': 'AIzaSyCfy_-gK8A2PfWCJgkLdi4Ph2intaJ8S7c'
    });
    
    google.charts.setOnLoadCallback(drawMap);

    function drawMap() {
        var mapData = new google.visualization.DataTable();
        mapData.addColumn('string', 'Continent');
        mapData.addColumn('string', 'Available Tickers');

        fetch(`http://localhost:2500/getRegionTicker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(dataRegion => {
                var continentTickers = {};

                dataRegion.forEach(item => {
                    if (!continentTickers[item.continent]) {
                        continentTickers[item.continent] = [];
                    }
                    continentTickers[item.continent].push(item.tickerid);
                });

                Object.keys(continentTickers).forEach(continent => {
                    var tickers = continentTickers[continent].join(', ');
                    mapData.addRow([continent, tickers]);
                });
                })
            .catch(error => console.error('Error:', error));

        var options = {
            showTooltip: true,
            showInfoWindow: true
        };

        var map = new google.visualization.Map(document.getElementById('chart_div'));

        map.draw(mapData, options);
    };
}

function showEnergySources(data){
    console.log(data);
    energyitemhtml = "<tr><th>Energy Sources:</th></tr>";

    data.forEach(item => {
        energyitemhtml += `<tr><td>${item.energysource}</td></tr>`;
    });

    //$("#tblEnergies").append(energyitemhtml);

    fetch(`http://localhost:2500/getEnergyTicker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(dataEnergy => {
                var energyTickers = {};
                var tickerCount = {};

                dataEnergy.forEach(item => {
                    if (!energyTickers[item.energysource]) {
                        energyTickers[item.energysource] = [];
                    }
                    energyTickers[item.energysource].push(item.tickerid);
                });

                Object.keys(energyTickers).forEach(energysource => {
                    tickerCount[energysource] = energyTickers[energysource].length;
                });

                const ctx = document.getElementById('energyChart');

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Solar', 'Biomass', 'Hydroelectric', 'Wind', 'Natural Gas', 'Nuclear'],
                        datasets: [{
                            label: 'Available Tickers',
                            data: Object.values(tickerCount),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        plugins: {
                            datalabels: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Energy sources',
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
                                    text: 'Number of tickers available',
                                    font: {
                                        size: 13,
                                        family: 'Arial'
                                    },
                                    color: 'green'
                                },
                                beginAtZero: true
                            }
                        },
                        tooltips: {
                            callbacks: {
                                label: function(context) {
                                    var energySource = context.xLabel;
                                    var tickerIds = energyTickers[energySource].join(', ');
                                    return 'Tickers: ' + tickerIds;
                                }
                            }
                        }                        
                    }
                });
            })
            .catch(error => console.error('Error:', error));
}
 