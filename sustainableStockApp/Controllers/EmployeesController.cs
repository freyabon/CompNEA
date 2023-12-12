using Microsoft.AspNetCore.Mvc;
using sustainableStockApp.Data;
using sustainableStockApp.Models;
using sustainableStockApp.Models.Domain;


namespace sustainableStockApp.Controllers
{
	public class EmployeesController : Controller
	{
		private readonly MVCDemoDBContext mvcDemoDbContext;
        public EmployeesController(MVCDemoDBContext mvcDemoDbContext)
        {
            this.mvcDemoDbContext = mvcDemoDbContext;
        }

        [HttpGet]
		public IActionResult Add()
		{
			return View();
		}

		[HttpPost]
		public async Task<IActionResult> Add(AddEmployeeViewModel addEmployeeRequest)
		{
			var employee = new Employee()
			{
				Id = Guid.NewGuid(),
				Name = addEmployeeRequest.Name,
				Email = addEmployeeRequest.Email,
				Salary = addEmployeeRequest.Salary,
				Department = addEmployeeRequest.Department,
				DateOfBirth = addEmployeeRequest.DateOfBirth,
			};

			await mvcDemoDbContext.Employees.AddAsync(employee);
			await mvcDemoDbContext.SaveChangesAsync();
			return RedirectToAction("Add");
		}
		
	}
}
