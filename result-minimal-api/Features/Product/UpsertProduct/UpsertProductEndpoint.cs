using Microsoft.AspNetCore.Mvc;
using result_minimal_api.Core.Common;

namespace result_minimal_api.Features.Product.UpsertProduct;

public class UpsertProductEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("products", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        [FromBody] UpsertProductRequestDto request,
        [FromServices] IUpsertProductCommandHandler upsertProductCommandHandler,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest("Product name is required");
        }

        var result = await upsertProductCommandHandler.HandleAsync(
            new UpsertProductCommand(request),
            cancellationToken);

        return result.ToMinimalApiResult();
    }
}
