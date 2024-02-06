$(document).ready(function(){
    define(["require", "exports", 'MindFusion.Charting'], function(require, exports, m){
        "use strict";

        var Charting = m.MindFusion.Charting;
        var Controls = m.MindFusion.Charting.Controls;
        var Collections = m.MindFusion.Charting.Collections;
        var Drawing = m.MindFusion.Charting.Drawing;

        var stockChart = new Controls.CandlestickChart(document.getElementById('stockChart')); // Change this line

        stockChart.title = "The Big Corporation";
        stockChart.theme.titleFontSize = 16;

        var dataList = new Collections.List();
        updateStock();

        function updateStock(){
            $.getJSON("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&outputsize=compact&interval=5min&apikey=M38Q4Y0SSL1MHCFQ", function(json) {
                var times = json["Time Series (Daily)"];
                var update = false;
                
                if (stockChart.series.count() > 0)
                        update = true;
                for(var time in times){
                    var stock_info = times[time];
                    
                    var dataItem = new Charting.StockPrice(stock_info["1. open"], stock_info["4. close"], stock_info["3. low"],
                    stock_info["2. high"], new Date(time));
                    
                    dataList.add(dataItem);
                } 
                var series = new Charting.StockPriceSeries(dataList);
                series.dateTimeFormat = Charting.DateTimeFormat.ShortTime;

                var data = new Collections.ObservableCollection();
                data.add(series);
                stockChart.series = data;
                stockChart.draw();
                
            });
        }

    });
});
