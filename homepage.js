$(document).ready(function(){
    $('.map-container').hide();
    $('.energy-container').hide();
    $('.divTickerInfo').hide();

    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');       

    if (usernameParam) {
        displayUsername(usernameParam);
    }

    $("#tickerMenu").click(function() {
        $('.divTickerInfo').show();
        $('.map-container').hide();
        $('.energy-container').hide();
        fetch(`http://localhost:2500/getTickerList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                showTickers(data, usernameParam);
            })
            .catch(error => console.error('Error:', error));
    })

    $("#regionMenu").click(function() {
        $('.divTickerInfo').hide();
        $("#tblTickers").empty();
        $('.map-container').show();
        $('.energy-container').hide();
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
    })

    $("#energyMenu").click(function() {
        $('.divTickerInfo').hide();
        $("#tblTickers").empty();
        $('.map-container').hide();
        $('.energy-container').show();
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
    })


    $('#btnSearch').on('click', function (e) {
        var search = $('#TickerSymbol').val();

        fetch(`http://localhost:2500/getRegionList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(regionData => {
                var regionList = [];
                regionData.forEach(item => {
                    regionList.push(item.continent);
                });

                capitalisedSearch = capitaliseWords(search);

                if (regionList.includes(capitalisedSearch)){
                    fetch(`http://localhost:2500/getTickerContinent?continent=${capitalisedSearch}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        .then(regionTicker => {
                            $('#searchRegion').empty();
                            let regionhtml = "<tr><th>TickerID</th></tr>";
                            regionTicker.forEach(item => {
                                regionhtml += `<tr><td>${item.tickerid}</td></tr>`;
                            });
                            $('#searchRegion').append(regionhtml);
                        })
                        .catch(error => console.error('Error:', error));
                } else{
                    fetch(`http://localhost:2500/getEnergyList`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        .then(energyData => {
                            var energyList = [];
                            energyData.forEach(item => {
                                energyList.push(item.energysource);
                            });

                            if (energyList.includes(capitalisedSearch)){
                                fetch(`http://localhost:2500/getTickerEnergy?energysource=${capitalisedSearch}`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                })
                                    .then(response => response.json())
                                    .then(energyTicker => {
                                        $('#searchEnergy').empty();
                                        let energyhtml = "<tr><th>TickerID</th></tr>";
                                        energyTicker.forEach(item => {
                                           energyhtml += `<tr><td>${item.tickerid}</td></tr>`;
                                        });
                                        $('#searchEnergy').append(energyhtml);
                                    })
                                    .catch(error => console.error('Error:', error));
                            } else {
                                fetch(`http://localhost:2500/getTickerList`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                })
                                    .then(response => response.json())
                                    .then(tickerData => {
                                        var tickerList = [];
                                        tickerData.forEach(item => {
                                            tickerList.push(item.tickerid);
                                        });

                                        tickerid = search.toUpperCase();

                                        if (tickerList.includes(tickerid)){
                                            const queryTicker = `?tickerid=${tickerid}&username=${usernameParam}`;
                                            window.location.href = `ticker_info.html${queryTicker}`;
                                        } else {
                                            alert("That ticker was not found in the database...")
                                        }
                                    })
                                    .catch(error => console.error('Error:', error));
                            }
                        })
                        .catch(error => console.error('Error:', error));
                }
            })
            .catch(error => console.error('Error:', error));
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

function showTickers(data, username){
    $("#tblTickers").empty();
    tickeritemhtml = "<tr><th>TickerID</th><th>Ticker Name</th><th>Continent</th></tr>";
    data.forEach(item => {
        tickeritemhtml += `<tr><td><a href="ticker_info.html?tickerid=${item.tickerid}&username=${username}">${item.tickerid}</a></td><td>${item.tickername}</td><td>${item.continent}</td></tr>`;
    });
    $("#tblTickers").append(tickeritemhtml);
}

function capitaliseWords(input){
    str = input.toLowerCase().split(' ').map(function(word){
        return word[0].toUpperCase() + word.substr(1);
    }).join(' ');
    return str;
}

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

        $('#mapInfo').append("Hover over a pin to view the available tickers for that region:");
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
 