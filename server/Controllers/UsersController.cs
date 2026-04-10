using ITServiceDesk.Api.Services;
using ITServiceDesk.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ITServiceDesk.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Create([FromBody] UpsertUserDto dto)
        {
            try
            {
                var user = _userService.Create(dto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpsertUserDto dto)
        {
            try
            {
                var user = _userService.Update(id, dto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/reset-password")]
        public IActionResult ResetPassword(int id, [FromBody] ResetPasswordDto dto)
        {
            try
            {
                var user = _userService.ResetPassword(id, dto.Password);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/change-password")]
        public IActionResult ChangePassword(int id, [FromBody] ChangePasswordDto dto)
        {
            try
            {
                _userService.ChangePassword(id, dto.CurrentPassword, dto.NewPassword);
                return Ok(new { message = "Cap nhat mat khau thanh cong." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _userService.Delete(id);
                return Ok(new { message = "Xoa user thanh cong." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
