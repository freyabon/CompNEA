using Microsoft.EntityFrameworkCore;
using QueryDataClass;
using stockAPI;
using sustainableStockApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<MVCDemoDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MvcDemoConnectionString")));
builder.Services.AddSession();
builder.Services.AddScoped<StockData>();
builder.Services.AddScoped<QueryDB>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=LoginPage}/{id?}");

app.Run();
