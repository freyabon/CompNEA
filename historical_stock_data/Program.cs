using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YahooFinanceApi;

namespace historical_stock_data
{
    internal class Program
    {
        static void Main(string[] args)
        {
            char continueStr = 'y';
            while (continueStr == 'y')
            {
                Console.WriteLine("Enter the stock ticker that you want historic data for: ");
                string symbol = Console.ReadLine().ToUpper();
                Console.WriteLine("Enter the amount of months of historic data that you want to recieve: ");
                int timespan = Convert.ToInt32(Console.ReadLine());
                DateTime endDate = DateTime.Today;
                DateTime startDate = DateTime.Today.AddMonths(-timespan);
                StockData stock = new StockData();
                var awaiter = stock.getStockData(symbol, startDate, endDate);
                if (awaiter.Result == 1)
                {
                    Console.WriteLine();
                    Console.WriteLine("Do you wish to get historical data for another ticker [y/n]: ");
                    continueStr = Convert.ToChar(Console.ReadLine());
                }
            }
            Console.WriteLine();
            Console.WriteLine("Have a nice day.");
            Console.ReadLine();
        }
    }

    class StockData
    {
        public async Task<int> getStockData(string symbol, DateTime startDate, DateTime endDate)
        {
            try
            {
                var historic_data = await Yahoo.GetHistoricalAsync(symbol, startDate, endDate);
                var security = await Yahoo.Symbols(symbol).Fields(Field.LongName).QueryAsync();
                var ticker = security[symbol];
                var companyName = ticker[Field.LongName];
                for (int i = 0; i < historic_data.Count; i++)
                {
                    Console.WriteLine(companyName + " Closing price on: " + historic_data.ElementAt(i).DateTime.Day + "/" + historic_data.ElementAt(i).DateTime.Month + "/" + historic_data.ElementAt(i).DateTime.Year + ": $" + Math.Round(historic_data.ElementAt(i).Close, 2));
                }
            }
            catch
            {
                Console.WriteLine("Failed to get symbol: " + symbol);
            }
            return 1;
        }
    }
}
