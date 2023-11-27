using System;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace QueryDataClass
{
    public class QueryDB
    {
        private readonly ILogger<QueryDB> _logger;

        public QueryDB(ILogger<QueryDB> logger)
        {
            _logger = logger;
        }

        private const string ConnectionString = "Server=tcp:sustainablestocks.database.windows.net,1433;Initial Catalog=TickerInfo;Persist Security Info=False;User ID=CloudSAceb07454;Password=Ozymandias1!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

        public async Task SelectDataInDatabase(string symbol, DateTime startDate, DateTime endDate)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    string selectQuery = "SELECT Dates, Symbol, Closes FROM historicalDataTest WHERE Symbol=@symbol AND Dates BETWEEN @startDate AND @endDate";

                    using (SqlCommand cmd = new SqlCommand(selectQuery, connection))
                    {
                        cmd.Parameters.AddWithValue("@symbol", symbol);
                        cmd.Parameters.AddWithValue("@startDate", startDate);
                        cmd.Parameters.AddWithValue("@endDate", endDate);

                        SqlDataReader rdr = await cmd.ExecuteReaderAsync();

                        while (rdr.Read())//reads one row at a time
                        {
                            string dates = rdr["Dates"].ToString();
                            int closes = Convert.ToInt32(rdr["Closes"]);

                            _logger.LogInformation($"Date: {dates}, Symbol: {symbol}, Closes: {closes}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve data from the database: {ex.Message}");
            }
        }
    }
}
