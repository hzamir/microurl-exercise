namespace AdroitSampleServer.Controllers;
using System.Text.RegularExpressions;
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
    private readonly Regex _validAliasRegex = new Regex("^[a-zA-Z0-9-_]+$");

    private IActionResult Unprocessable(UrlPair pair)   => UnprocessableEntity(new UrlPairError(pair, "Invalid URL"));
    private IActionResult AliasInUse(UrlPair pair)      => Conflict(new UrlPairError(pair, "Proposed URL alias already in use"));
    private IActionResult AliasIllegal(UrlPair pair)      => UnprocessableEntity(new UrlPairError(pair, "Proposed URL alias contains illegal characters"));

    private IActionResult AliasIsUnknown(UrlPair pair)  => NotFound(new UrlPairError(pair, "Alias is Unknown"));

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
            if (!_validAliasRegex.IsMatch(pair.Alias))
                return AliasIllegal(pair);

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

    [HttpGet("statistics")]
    public IActionResult Statistics(bool group = false, string? sort = null, int maxRecords = 100, int page = 0)
    {
        var urlData = _urlConverter.UrlStats(); // Assuming this method returns all URL data

        // since we compactly represent stats as arrays of evident values
        // it is necessary to cast them as needed for longs or strings when sorting
        // customizing  json output to use typed values but prevent auto-output as named json fields
        // is too much trouble for one little controller, so we are just naming the indices of the output
        const int aliasIndex = 0;
        const int countIndex = 1;

        if (group)
        {
            var groupedData = urlData
                .GroupBy(x => x.LongUrl)
                .Select(g => new
                {
                    Url = g.Key,
                    Aliases = g.Select(x => new object[] { x.Alias, x.Count }).ToList()
                })
                .ToList();

            int totalPages = (int)Math.Ceiling(groupedData.Count / (double)maxRecords);

            var paginatedGroupedData = groupedData
                .Skip(page * maxRecords)
                .Take(maxRecords)
                .ToList();

            return Ok(new 
            { 
                PageCount = totalPages,
                CurrentPage = page,
                MaxRecordsPerPage = maxRecords,
                UniqueUrlCount = groupedData.Count, 
                AliasCount = urlData.Count, 
                Urls = paginatedGroupedData 
            });
        }
        else
        {
            var aliases = urlData.Select(x => new object[] { x.Alias, x.Count, x.LongUrl }).ToList();
            if (sort == "alias")
                aliases = aliases.OrderBy(x => (string)x[aliasIndex]).ToList();
            else if (sort == "count")
                aliases = aliases.OrderByDescending(x => (long)x[countIndex]).ThenBy(x => (string)x[aliasIndex]).ToList();

            int totalPages = (int)Math.Ceiling(aliases.Count / (double)maxRecords);

            var paginatedAliases = aliases
                .Skip(page * maxRecords)
                .Take(maxRecords)
                .ToList();

            return Ok(new 
            { 
                PageCount = totalPages,
                CurrentPage = page,
                MaxRecordsPerPage = maxRecords,
                AliasCount = aliases.Count, 
                Aliases = paginatedAliases 
            });
        }
    }}