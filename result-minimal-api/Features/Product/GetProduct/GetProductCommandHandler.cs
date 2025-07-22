using result_minimal_api.Core.Common;
using result_minimal_api.Core.Storage.Product;

namespace result_minimal_api.Features.Product.GetProduct;

public record GetProductCommand(string id);

public interface IGetProductCommandHandler
{
    Task<Result<ProductDao>> HandleAsync(GetProductCommand command, CancellationToken cancellationToken);
}



public class GetProductCommandHandler(IProductRepository ProductRepository) : IGetProductCommandHandler
{
    public async Task<Result<ProductDao>> HandleAsync(
        GetProductCommand command,
        CancellationToken ct) => await ProductRepository.GetProductByIdAsync(command.id, ct);
}
