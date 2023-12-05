using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Data.SqlClient;
using System.Threading.Tasks;
using YahooFinanceApi;
using Microsoft.Extensions.Logging;

namespace stockAPI
{
    public class StockData
    {
        private readonly ILogger<StockData> _logger;

        public StockData(ILogger<StockData> logger)
        {
            _logger = logger;
        }
        public StockData()
        {

        }
        public string Dates { get; set; }
        public int Closes { get; set; }


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
                    _logger.LogInformation($"{companyName} Closing price on: " +
                                           $"{historicData[i].DateTime.Day}/{historicData[i].DateTime.Month}/" +
                                           $"{historicData[i].DateTime.Year}: ${Math.Round(historicData[i].Close, 2)}");
                }

                return historicData;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to get symbol: {symbol}. Error: {ex.Message}");
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
                _logger.LogError($"Failed to store data in the database: {ex.Message}");
            }
        }
    }
}