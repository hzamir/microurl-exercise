namespace AdroitSampleServer.Middleware;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using UrlMagic;

// this is a middleware for accepting paths with microUrls and redirecting where there is a match
public class RecognizeAndRedirectMicroUrls
{
    private readonly RequestDelegate _next;
    private readonly UrlConverter _urlConverter;

    public RecognizeAndRedirectMicroUrls(RequestDelegate next, UrlConverter urlConverter)
    {
        _next = next;
        _urlConverter = urlConverter;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string? path = context.Request.Path.Value;
        string? originalUrl = null;

        if (!string.IsNullOrEmpty(path))
            originalUrl = _urlConverter.LookupUrl(path.TrimStart('/'));

        if (originalUrl != null)
            context.Response.Redirect(originalUrl);
        else
            await _next(context);
    }}