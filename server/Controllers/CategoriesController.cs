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

    // [HttpGet]
    // public IActionResult Get(string type)
    // {
    //     var data = _context.Categories
    //     .Where(x => x.Type == type)
    //     .ToList();
    //     return Ok(data);


    // }
    [HttpGet]
    public IActionResult GetCategories([FromQuery] string? type = null)
    {
        try
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(c => c.Type == type);
            }

            var categories = query.ToList();
            return Ok(categories); // Trả về array, không phải object
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}