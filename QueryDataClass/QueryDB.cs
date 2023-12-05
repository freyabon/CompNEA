using System;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Globalization;
using stockAPI;


namespace QueryDataClass
{
    public class QueryDB
    {
        private readonly ILogger<QueryDB> _logger;
        StockData data = new StockData();

        public QueryDB(ILogger<QueryDB> logger)
        {
            _logger = logger;
        }

        private const string ConnectionString = "Server=tcp:sustainablestocks.database.windows.net,1433;Initial Catalog=TickerInfo;Persist Security Info=False;User ID=CloudSAceb07454;Password=Ozymandias1!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

        public async Task<IEnumerable<StockData>> SelectDataInDatabase(string symbol, DateTime startDate, DateTime endDate)
        {
            string sDate = Convert.ToString(startDate);
            string eDate = Convert.ToString(endDate);

            try
            {
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    string selectQuery = "SELECT Dates, Symbol, Closes FROM historicalDataTest WHERE Symbol=@symbol AND CONVERT(DATETIME, Dates, 103) BETWEEN @startDate AND @endDate";

                    using (SqlCommand cmd = new SqlCommand(selectQuery, connection))
                    {
                        cmd.Parameters.AddWithValue("@symbol", symbol);
                        cmd.Parameters.AddWithValue("@startDate", startDate);
                        cmd.Parameters.AddWithValue("@endDate", endDate);

                        SqlDataReader rdr = await cmd.ExecuteReaderAsync();

                        List<StockData> result = new List<StockData>();
                        while (rdr.Read())
                        {
                            StockData data = new StockData
                            {
                                Dates = rdr["Dates"].ToString(),
                                Closes = Convert.ToInt32(rdr["Closes"])
                            };
                            result.Add(data);
                            _logger.LogInformation($"Date: {data.Dates}, Symbol: {symbol}, Closes: {data.Closes}");
                        }


                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve data from the database: {ex.Message}");
                return null;
            }
        }

    }
}
