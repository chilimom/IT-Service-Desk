using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Services;
using Microsoft.AspNetCore.Mvc;
using ITServiceDesk.Api.Data;   // 👈 THÊM


[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Get(string type)
    {
        var data = _context.Categories
        .Where(x => x.Type == type)
        .ToList();



    }
}