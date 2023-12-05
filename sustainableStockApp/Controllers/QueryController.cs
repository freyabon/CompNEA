using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QueryDataClass;
using stockAPI;
using System.ComponentModel.DataAnnotations;

namespace sustainableStockApp.Controllers
{
    public class QueryModel
    {
        [Required(ErrorMessage = "Ticker Symbol is required")]
        public string symbol { get; set; }

        [Required(ErrorMessage = "Start Date is required")]
        public DateTime startDate { get; set; }

        [Required(ErrorMessage = "End Date is required")]
        public DateTime endDate { get; set; }
    }

    public class SearchViewModel
    {
        public string Symbol { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public IEnumerable<StockData> QueriedData { get; set; }
    }

    public class CombinedViewModel
    {
        public QueryModel QueryModel { get; set; }
        public SearchViewModel SearchViewModel { get; set; }
        public IEnumerable<StockData> QueriedData { get; set; }
        public string? symbol { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }


    public class QueryController : Controller
    {
        private readonly ILogger<StockController> _logger;
        private readonly QueryDB _queryDB;

        public QueryController(ILogger<StockController> logger, QueryDB queryDB)
        {
            _logger = logger;
            _queryDB = queryDB;
        }

        public IActionResult Dashboard()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Search(QueryModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("Error");
            }

            try
            {
                var data = await _queryDB.SelectDataInDatabase(model.symbol, model.startDate, model.endDate);

                if (data == null)
                {
                    return View("Error");
                }

                var viewModel = new CombinedViewModel
                {
                    QueryModel = model,
                    SearchViewModel = new SearchViewModel
                    {
                        Symbol = model.symbol,
                        StartDate = model.startDate,
                        EndDate = model.endDate,
                        QueriedData = data
                    },
                    QueriedData = data,
                    symbol = model.symbol,
                    startDate = model.startDate,
                    endDate = model.endDate
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during search: {ex.Message}");
                return View("Error");
            }
        }


    }
}
