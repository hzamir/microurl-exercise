namespace AdroitSampleServer.Models;

public record UrlPair(string Original, string Alias);

public record UrlPairError(string Original, string Alias, string Error)
{
    public UrlPairError(UrlPair pair, string error) : this(pair.Original, pair.Alias, error)
    {
    }
}

// a more complete return value includes the actual url to use, not just the micro path
public record FullAlias(string Original, string Alias, string MicroUrl)
{
    public FullAlias(UrlPair pair, string microUrl) : this(pair.Original, pair.Alias, microUrl)
    {
    }
}

public record UrlStat( string Alias, string LongUrl, long Count);

public record AliasCount(string Alias, long Count);