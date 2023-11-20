using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Data.SqlClient;
using System.Threading.Tasks;
using YahooFinanceApi;

namespace stockAPI
{
    public class StockData
    {
        private const string ConnectionString = "Server=tcp:sustainablestocks.database.windows.net,1433;Initial Catalog=TickerInfo;Persist Security Info=False;User ID=CloudSAceb07454;Password=Ozymandias1!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

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
                        string insertQuery = $"INSERT INTO historicalDataTest (Dates, Symbol, Closes) " +
                                             $"VALUES ('{quote.DateTime}', '{symbol}', {Convert.ToInt32(Math.Round(quote.Close, 2))})";

                        using (SqlCommand cmd = new SqlCommand(insertQuery, connection))
                        {
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