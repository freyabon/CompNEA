using Microsoft.AspNetCore.Mvc;

namespace sustainableStockApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : Controller
    {
        private readonly StockData _stockData;

        public StockController(StockData stockData)
        {
            _stockData = stockData;
        }

        [HttpGet("GetHistoricalData")]
        public async Task<IActionResult> GetHistoricalData(string symbol, int months)
        {
            DateTime endDate = DateTime.Today;
            DateTime startDate = DateTime.Today.AddMonths(-months);

            try
            {
                var historicData = await _stockData.GetStockData(symbol, startDate, endDate);
                await _stockData.StoreDataInDatabase(historicData, symbol);

                return Ok("Data retrieved and stored successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to retrieve or store data: {ex.Message}");
            }
        }
    }
}
