using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Orion.Auth.Models;
using Orion.Auth.Services;
using Orion.Infrastructure.Database.Entities;

namespace Orion.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ICurrentUserService currentUserService,
        UserManager<ApplicationUser> userManager,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _currentUserService = currentUserService;
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Вход в систему
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers.UserAgent.ToString();
            var result = await _authService.LoginAsync(request, ipAddress, userAgent, cancellationToken);

            if (result == null)
            {
                return Unauthorized(new { message = "Invalid email/phone or password" });
            }

            // Если RememberMe == true, устанавливаем refresh token в cookie
            if (request.RememberMe)
            {
                SetRefreshTokenCookie(result.RefreshToken, result.RefreshTokenExpiresAt);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for {EmailOrPhone}", request.EmailOrPhone);
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    /// <summary>
    /// Выход из системы
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = _currentUserService.UserId;
            if (userId.HasValue)
            {
                var sessionIdClaim = User.FindFirst("sid")?.Value;
                var sessionId = sessionIdClaim is not null ? Guid.Parse(sessionIdClaim) : (Guid?)null;
                await _authService.LogoutAsync(userId.Value, sessionId, cancellationToken);
            }

            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout error");
            return StatusCode(500, new { message = "An error occurred during logout" });
        }
    }

    /// <summary>
    /// Обновление access token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? request, CancellationToken cancellationToken = default)
    {
        try
        {
            var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token is required" });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress, cancellationToken);

            if (result == null)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            // Обновляем cookie если есть
            if (Request.Cookies["refreshToken"] != null)
            {
                SetRefreshTokenCookie(result.RefreshToken, result.RefreshTokenExpiresAt);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refresh token error");
            return StatusCode(500, new { message = "An error occurred during token refresh" });
        }
    }

    /// <summary>
    /// Получение информации о текущем пользователе
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = _currentUserService.UserId;
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId.Value.ToString());
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);

            var userInfo = new UserInfo
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                FullName = user.FullName,
                Roles = roles.ToList()
            };

            return Ok(userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get current user error");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Получение всех claims текущего пользователя (для отладки)
    /// </summary>
    [HttpGet("claims")]
    [Authorize]
    public IActionResult GetClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

        return Ok(new
        {
            userId = _currentUserService.UserId,
            userName = _currentUserService.UserName,
            email = _currentUserService.Email,
            isAuthenticated = _currentUserService.IsAuthenticated,
            roles = _currentUserService.GetRoles(),
            claims
        });
    }

    /// <summary>
    /// Проверка валидности токена
    /// </summary>
    [HttpGet("validate")]
    [Authorize]
    public IActionResult ValidateToken()
    {
        return Ok(new { valid = true, message = "Token is valid" });
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expiresAt)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = expiresAt,
            Path = "/"
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
