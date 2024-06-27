using System.Collections.Concurrent;
namespace AdroitSampleServer.UrlMagic;

// the Singleton guarantee for UrlConverter is in Program.cs services.AddSingleton<UrlConverter>(); // ensure there is only one
public class UrlConverter
{
    private readonly ConcurrentDictionary<string, UrlData> _dict = new ConcurrentDictionary<string, UrlData>();
    private readonly Random _random = new Random();
    
    // todo replace this with a better generator
    private  string GenerateTinyUrl()
    {
        byte[] bytes = new byte[6];
        _random.NextBytes(bytes);

        var base64 = Convert.ToBase64String(bytes);
        return base64.Replace('+', '-').Replace('/', '_'); // url safe, should not end in '=' padding based on output length
    } 
    
    // add a tiny url association to the dictionary
    public string? ApplyTinyUrl(string original, string alias)
    {
        var wasAdded = _dict.TryAdd(alias, new UrlData(original));
        return wasAdded ? alias : null;
    }

    public string? AllocateTinyUrl(string original)
    {
        var alias = GenerateTinyUrl();
        var wasAdded = _dict.TryAdd(alias, new UrlData(original));
        return wasAdded?  alias: null;
    }


    // remove a tiny url association from the dictionary
    public string? RevokeTinyUrl(string alias)
    {
        if (_dict.TryGetValue(alias, out var urlData))
        {
            _dict.TryRemove(alias, out _);
            return urlData.Url;
        }
        return null;
    }
    

    public string? LookupUrl(string alias)
    {
        if (_dict.TryGetValue(alias , out var urlData))
        {
            urlData.IncrementCounter();
            return urlData.Url;
        }
        return null;
    }
    
    public static bool IsValidUrl(string url)
    {
        var result = Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                      && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        return result;
    }

 // my urls functionality was not asked for,  tracks all urls you submitted
 
    
}

public class UrlData
{
    private long _counter;
    public string Url { get; }

    public long Counter { get => _counter; }

    public UrlData(string url)
    {
        Url = url;
        _counter = 0;
    }
    
    public long IncrementCounter()
    {
        return Interlocked.Increment(ref _counter);
    }
}