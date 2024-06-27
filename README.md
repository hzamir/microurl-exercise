# microurl-exercise
Not having a PC, or Visual Studio, I used Jetbrains Rider to write this project on a Mac. 
It's the first time I've written .NET code on a Mac.

## System prerequisites
* a recent version of node/npm. I tested with node 22, but there is probably no issue with at least node 18
* .NET 8.0 SDK with the dotnet command available in the shell and pointing to it

## Build Instructions
```shell
dotnet build
dotnet run
```

The build for the react client is triggered by the C# project
See the [Client docs](ReactClient/README.md) for more information, about the React client

* the server's appsettings.yaml file must enable CORS (it's been disabled by default) to use server apis

> **Note:** Note the DockerFile while still included is **not complete**. It has no section to guarantee npm builds.

## Text of the exercise requirements I received

<pre>
In this round, we will ask you to write a small application as proof of concept for a TinyURL-style service.

*** We do not need to see an actual persistent storage layer. Please do NOT use EntityFramework (even in-memory), 
SQLite, Redis, or similar. ***

TinyURL is a service where users can create short links, such as tinyurl.com/3rp36a3s, redirecting to longer links, 
such as https://www.adroit-tt.com. Please do NOT use the actual TinyURL or any other URL shortening service.

We would like you to include a small web UI to interact with a mockup tiny URL service (do not use the actual TinyURL 
or any other pass-through service.) The service (back-end part of the assignment) should be written in C#; for the 
web UI, please use React. We do not want auto-generated (i.e., swagger) web code. Similarly, we do not need to see an 
actual persistent storage layer. Feel free to mock this out in memory however you best see fit. Lastly, note that a 
single long URL might map to a few short URLs.

Although this is a POC, we would still like to see it designed with architecture in mind. To this end, please consider 
your schema, service methods, and constraints accordingly. The web service should safely handle concurrent requests 
from multiple users; however, each user is anonymous without a separate individual account. 

The POC should support:

Creating and Deleting short URLs with associated long URLs.
Getting the long URL from a short URL.
Getting statistics on the number of times a short URL has been "clicked," i.e., the number of times its long URL has been retrieved.
Entering a custom short URL or letting the app randomly generate one while maintaining the uniqueness of short URLs.
</pre>

## Interpretation or requirements and their consequences
* **No persistence layer required**
  * The aliases can only live as long as the server is running. If server quits or dies, the aliases are lost.
  * Single server instance only. It cannot scale to multiple servers (just multiple threads).
  * Stats are of course reset on server restart.
* **a single long URL might map to a few short URLs**
  * When generating a URL, do not look up the long URL to see if it already exists. Just generate a new alias.
  * This has an implication for stats, so I provide a grouped view of stats by long URL.
* **Safely serve concurrent requests**
  * Given the above scaling limitation above (no persistence), and exercise scope:
    * Used .NET hosting and its instantiation of controllers as needed
    * Ensured they all used a singleton reentrant UrlConverter instance
    * Relied on ConcurrentDictionary to store the URLs (though in general not ideal to every task, it seemed appropriate
      given the scale/scope of the exercise
* **Each user is anonymous without an account**
  * The requirements made no mention of security concerns, so _I did not go there_, enhancements would include
    * Nonces to prevent replay attacks
    * Rate limits

## Other observations
* Tiny urls
  * Lossy by definition
  * Need no correlation to original URLS (in fact cannot correlate when user chooses his own alias)
  * Therefore, the algorithm to generate them is not critical, it is more important the urls be legible
    * I chose a 8 character modified base64, notwithstanding the fact 
* No limitation on supported Url protocols (rather than just http/https)
  * I allow aliases to protocols like ftp, etc. since they are also potentially long.
  * This choice can easily be made more stringent
