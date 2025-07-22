using Microsoft.AspNetCore.Mvc;
using result_minimal_api.Core.Common;

namespace result_minimal_api.Features.Product.GetProduct;

public class GetProductEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("products/{id}", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        string id,
        [FromServices] IGetProductCommandHandler getProductCommandHandler,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return Results.BadRequest("Product ID is required");
        }

        var result = await getProductCommandHandler.HandleAsync(
            new GetProductCommand(id),
            cancellationToken);

        return result.Map(productDao => new GetProductResponseDto(productDao.Id, productDao.Name))
                .ToMinimalApiResult();
    }
}