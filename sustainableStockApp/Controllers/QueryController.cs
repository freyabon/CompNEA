using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QueryDataClass;
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
                await _queryDB.SelectDataInDatabase(model.symbol, model.startDate, model.endDate);
                return RedirectToAction("Dashboard", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during search: {ex.Message}");
                return View("Error");
            }
        }

    }
}
