using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Services;
using Microsoft.AspNetCore.Mvc;
using ITServiceDesk.Api.Data;   // 👈 THÊM
[ApiController]
[Route("api/[controller]")]
public class MaintenanceTypesController : ControllerBase
{
    private readonly TicketService _ticketService;

    public MaintenanceTypesController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var types = _ticketService.GetMaintenanceTypes();
        return Ok(types);
    }
}