using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITServiceDesk.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly TicketService _ticketService;

        public TicketsController(TicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var tickets = _ticketService.GetAll();
                return Ok(tickets);
            }
            catch (Exception exception)
            {
                return StatusCode(500, new { message = "An error occurred", details = exception.Message });
            }
        }
        [HttpGet("factories")]
        public IActionResult GetFactories()
        {
            var data = _ticketService.GetFactories();
            return Ok(data);
        }
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var ticket = _ticketService.GetById(id);

            if (ticket == null)
                return NotFound($"Khong tim thay ticket id = {id}");

            return Ok(ticket);
        }

        [HttpGet("{id}/logs")]
        public IActionResult GetTicketLogs(int id)
        {
            var logs = _ticketService.GetTicketLogs(id);

            if (logs == null || logs.Count == 0)
                return NotFound($"Khong co log cho ticket id = {id}");

            return Ok(logs);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateTicketDto dto)
        {
            try
            {
                var ticket = _ticketService.Create(dto);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });  // 👈 QUAN TRỌNG
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateTicketDto dto)
        {
            var result = _ticketService.Update(id, dto);

            if (!result)
                return NotFound($"Khong tim thay ticket id = {id}");

            return Ok("Cap nhat thanh cong");
        }

        [HttpPut("{id}/user")]
        public IActionResult UserUpdate(int id, [FromBody] UserUpdateTicketDto dto)
        {
            var result = _ticketService.UserUpdate(id, dto);

            if (!result)
                return NotFound($"Khong tim thay ticket id = {id}");

            return Ok("Nguoi dung cap nhat ticket thanh cong");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _ticketService.Delete(id);

            if (!result)
                return NotFound($"Khong tim thay ticket id = {id}");

            return Ok("Xoa ticket thanh cong");
        }

        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            var data = _ticketService.GetDashboard();
            return Ok(data);
        }
        [HttpGet("my")]
        public IActionResult GetMyTickets([FromQuery] int userId)
        {
            try
            {
                var tickets = _ticketService.GetByUser(userId);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


    }
}
