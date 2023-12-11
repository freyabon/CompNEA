using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QueryDataClass;
using stockAPI;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;

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

    public class DataContext : DbContext
    {
        public DbSet<QueryModel> QueriedData { get; set; }
    }


    public class QueryController : Controller
    {
        private readonly ILogger<StockController> _logger;
        private readonly QueryDB _queryDB;
        DataContext context = new DataContext();

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
        public async Task<IActionResult> callData(QueryModel model)
        {
            var dataResult = await _queryDB.SelectDataInDatabase(model.symbol, model.startDate, model.endDate);

            //List<string> dates = dataResult.Item1;
            //List<int> closes = dataResult.Item2;

            /*for (int i = 0; i < dates.Count; i++)
            {
                QueryModel dataToSave = new QueryModel
                {
                    symbol = model.symbol,
                    startDate = DateTime.Parse(dates[i]),
                    endDate = DateTime.Parse(dates[i]) // Assuming endDate should be of DateTime type
                };

                context.QueriedData.Add(dataToSave);
            }*/

            context.SaveChanges();

            string message = "SUCCESS";
            return Json(new { Message = message });
        }
        public JsonResult getData(string id)
        {
            List<QueryModel> data = new List<QueryModel>();
            data = context.QueriedData.ToList();
            return Json(data);
        }

    }
}
