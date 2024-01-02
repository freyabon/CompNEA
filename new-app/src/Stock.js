import React from 'react';

class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockChartXValues: [], //arrays
            stockChartYValues: []
        }
    }

    componentDidMount() {
        this.fetchStock();
    }

    fetchStock(){
        //fetch api
        //const API_KEY = 'M38Q4Y0SSL1MHCFQ';
        let API_Call = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=TSCO.LON&outputsize=full&apikey=M38Q4Y0SSL1MHCFQ';

        fetch(API_Call)
            .then(
                function(response){
                    return response.json();
                }
            )
            .then(
                function(data){
                    console.log(data);
                }
            )
    }

    render() {
        return(
            <div>
                <h1>Stock Market</h1>
            </div>
        )
    }
}

export default Stock;