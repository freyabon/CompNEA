using Microsoft.AspNetCore.Mvc;

namespace sustainableStockApp.Controllers
{
    public class UserController : Controller
    {
        public IActionResult Login()
        {
            HttpContext.Session.SetString("UserId", "123"); //change this to query database
            return RedirectToAction("Dashboard", "Home");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("UserId");
            return RedirectToAction("Login", "Home");
        }
    }
}
