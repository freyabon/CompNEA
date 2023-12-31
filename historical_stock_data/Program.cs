﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Data.SqlClient;
using System.Threading.Tasks;
using YahooFinanceApi;

namespace historical_stock_data
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            char continueStr = 'y';
            while (continueStr == 'y')
            {
                Console.WriteLine("Enter the stock ticker that you want historic data for: ");
                string symbol = Console.ReadLine().ToUpper();
                Console.WriteLine("Enter the amount of months of historic data that you want to receive: ");
                int timespan = Convert.ToInt32(Console.ReadLine());
                DateTime endDate = DateTime.Today;
                DateTime startDate = DateTime.Today.AddMonths(-timespan);

                StockData stock = new StockData();

                var historicData = await stock.GetStockData(symbol, startDate, endDate);

                await stock.StoreDataInDatabase(historicData, symbol);

                Console.WriteLine();
                Console.WriteLine("Do you wish to get historical data for another ticker [y/n]: ");
                continueStr = Convert.ToChar(Console.ReadLine());
            }

            Console.WriteLine();
            Console.WriteLine("Have a nice day.");
            Console.ReadLine();
        }
    }

    class StockData
    {
        
        private const string ConnectionString = "Server=localhost\\SQLEXPRESS01;Database=master;Trusted_Connection=True;";

        public async Task<dynamic> GetStockData(string symbol, DateTime startDate, DateTime endDate)
        {
            try
            {
                dynamic historicData = await Yahoo.GetHistoricalAsync(symbol, startDate, endDate);
                var security = await Yahoo.Symbols(symbol).Fields(Field.LongName).QueryAsync();
                var ticker = security[symbol];
                var companyName = ticker[Field.LongName];

                for (int i = 0; i < historicData.Count; i++)
                {
                    Console.WriteLine($"{companyName} Closing price on: " +
                                      $"{historicData[i].DateTime.Day}/{historicData[i].DateTime.Month}/" +
                                      $"{historicData[i].DateTime.Year}: ${Math.Round(historicData[i].Close, 2)}");
                }

                return historicData;
            }
            catch
            {
                Console.WriteLine("Failed to get symbol: " + symbol);
                return null;
            }
        }

        public async Task StoreDataInDatabase(dynamic data, string symbol)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    foreach (var quote in data)
                    {
                        string insertQuery = "INSERT INTO historicalDataTest (Dates, Symbol, Closes) " +
                                             "VALUES (@dates, @symbol, @closes)";

                        using (SqlCommand cmd = new SqlCommand(insertQuery, connection))
                        {
                            cmd.Parameters.AddWithValue("@dates", quote.DateTime);
                            cmd.Parameters.AddWithValue("@symbol", symbol);
                            cmd.Parameters.AddWithValue("@closes", Math.Round(quote.Close, 2));

                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to store data in the database: {ex.Message}");
            }
        }

    }
}
