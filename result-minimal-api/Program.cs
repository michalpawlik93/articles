using result_minimal_api.Core.Common;
using result_minimal_api.Core.Storage.Product;
using result_minimal_api.Features.Product.GetProduct;
using result_minimal_api.Features.Product.UpsertProduct;
using System.Reflection;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());

builder.Services.AddScoped<IGetProductCommandHandler, GetProductCommandHandler>();
builder.Services.AddScoped<IUpsertProductCommandHandler, UpsertProductCommandHandler>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

var app = builder.Build();

app.MapEndpoints();

app.Run();

[JsonSerializable(typeof(UpsertProductRequestDto))]
[JsonSerializable(typeof(UpsertProductResponseDto))]
[JsonSerializable(typeof(GetProductResponseDto))]
[JsonSerializable(typeof(ProductDao))]
[JsonSerializable(typeof(string))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}