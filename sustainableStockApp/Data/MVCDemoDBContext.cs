using System.Data.Entity;
using Microsoft.EntityFrameworkCore;
using sustainableStockApp.Models.Domain;

namespace sustainableStockApp.Data
{
	public class MVCDemoDBContext : Microsoft.EntityFrameworkCore.DbContext
	{
		public MVCDemoDBContext(DbContextOptions options) : base(options)
		{

		}


        public Microsoft.EntityFrameworkCore.DbSet<Employee> Employees { get; set; }
    }
}
