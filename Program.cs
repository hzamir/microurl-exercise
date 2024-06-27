namespace AdroitSampleServer;
using Microsoft.AspNetCore.Http.Extensions; 
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration.Yaml;
using UrlMagic;
using Middleware;

class Program
{
    static void Main(string[] args)
    {
        var provider = new FileExtensionContentTypeProvider
        {
            Mappings =
            {
                [".yaml"] = "text/yaml"  // yaml not supported by default
            }
        };

        var fileOptions = new StaticFileOptions
        {
            ContentTypeProvider = provider
        };

        Host
            .CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
                webBuilder.UseWebRoot("ReactClient/dist");
                webBuilder.ConfigureAppConfiguration((hostingContext, config) =>
                {
                    config.AddYamlFile("appsettings.yaml", optional: false, reloadOnChange: true);
                });
                webBuilder.ConfigureServices((context, services) =>
                {
                    services.AddSingleton<UrlConverter>(); // ensure there is only one
                    services.AddControllers();

                    // settings has an optional CORS temporarily to use this server with a client developed
                    // faster directly in webstorm
                    var allowAnyOrigin = context.Configuration.GetValue<bool>("AllowAnyOrigin");
                    if(allowAnyOrigin) {    
                        services.AddCors(options =>
                            {
                                options.AddPolicy("AllowAnyOrigin",
                                    builder =>
                                    {
                                        builder.AllowAnyOrigin()
                                            .AllowAnyHeader()
                                            .AllowAnyMethod();
                                    });
                            }); 
                    }
                })
                .Configure(config =>
                {
                    // config.UseDeveloperExceptionPage();  // should only be in env.IsDevelopment()
                    config.UseStatusCodePages(async context =>
                    {
                        var response = context.HttpContext.Response;

                        if (response.StatusCode == StatusCodes.Status404NotFound)
                        {
                            response.ContentType = "text/html";
                            
                            // get both the full url and part of the path that might
                            // look like a microUrl
                            
                            var request = context.HttpContext.Request;
                            var fullUrl = request.GetDisplayUrl();
                            var path = request.Path.Value ?? "";
                            if (!string.IsNullOrEmpty(path)) 
                                path = path.TrimStart('/');
                            await response.WriteAsync($@"
<html><body>
<h1>404 Not Found</h1>
<p> You attempted to reach the following url</p>
<p> {fullUrl} </p>
This part of the url '{path}' may have been a custom or generated alias that is incorrect or no longer avaiable on this system.
</body></html>
");                        }
                    });
                    config.UseMiddleware<RecognizeAndRedirectMicroUrls>();
                    config.UseDefaultFiles(); // Add this line
                    config.UseStaticFiles(fileOptions);
                    config.UseRouting(); // Add this line
                    config.UseCors("AllowAnyOrigin"); // Add this line
                    config.UseEndpoints(endpoints =>
                    {
                        endpoints.MapControllers(); // Add this line
                    });

                });
            })
            .Build()
            .Run();
    }
}