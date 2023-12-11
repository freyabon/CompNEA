using Microsoft.AspNetCore.Mvc;

namespace sustainableStockApp.Controllers
{
	public class EmployeesController : Controller
	{
		[HttpGet]
		public IActionResult Add()
		{
			return View();
		}

		
	}
}
