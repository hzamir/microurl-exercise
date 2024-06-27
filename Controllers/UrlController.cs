namespace AdroitSampleServer.Controllers;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using Models;
using UrlMagic;

[ApiController]
[Route("api/[controller]")]
public class UrlController : ControllerBase
{
    private readonly UrlConverter _urlConverter;
    private readonly string _serverUrl;  // used to generate a full url from alias
    
    private ObjectResult Unprocessable(UrlPair pair)   => StatusCode(422, new UrlPairError(pair, "Invalid URL"));
    private ObjectResult AliasInUse(UrlPair pair)      => StatusCode(409, new UrlPairError(pair, "Proposed URL alias already in use"));
    private ObjectResult AliasIsUnknown(UrlPair pair)  => StatusCode(404, new UrlPairError(pair, "Alias is Unknown"));

    public UrlController(UrlConverter urlConverter, IConfiguration configuration)
    {
        _urlConverter = urlConverter;
        _serverUrl = configuration["ServerUrl"] ?? "http://badserverurl/";  // appsettings.yaml must be correct
    }
    
    [HttpGet("lookup")]
    public IActionResult LookupUrl([FromQuery(Name = "url")] string alias)
    {
        var original = _urlConverter.LookupUrl(alias);
        return original != null ?
            Ok(new UrlPair(original, alias)): 
            AliasIsUnknown(new UrlPair("", alias));
    }

    
    [HttpPost("create")]
    public IActionResult CreateTinyUrl([FromBody] UrlPair pair)
    {
        if (!UrlConverter.IsValidUrl(pair.Original))
            return Unprocessable(pair);
        if (!string.IsNullOrEmpty(pair.Alias))
        {
            var result = _urlConverter.ApplyTinyUrl(pair.Original, pair.Alias);
            return result != null?
                Ok(new FullAlias(pair,$"{_serverUrl}/{result}")) :
                AliasInUse(pair);
        }
        else
        {
            var result  = _urlConverter.AllocateTinyUrl(pair.Original);
            return result != null ?
                Ok(new FullAlias(pair.Original, result, $"{_serverUrl}/{result}")) :
                Unprocessable(pair);
        }
    }    
    [HttpPost("revoke")]
    public IActionResult RevokeTinyUrl([FromBody] UrlPair pair)
    {
        var originalUrl = _urlConverter.RevokeTinyUrl(pair.Alias);
        return originalUrl != null? 
            Ok(new UrlPair(originalUrl, pair.Alias)):
            AliasIsUnknown(pair);
    }

}