using result_minimal_api.Core.Common;

namespace result_minimal_api.Core.Storage.Product;

public interface IProductRepository
{
    Task<Result> UpsertProductAsync(ProductDao product, CancellationToken ct = default);
    Task<Result<ProductDao>> GetProductByIdAsync(string id, CancellationToken ct = default);
}

public class ProductRepository : IProductRepository
{
    private static readonly string HardcodedProductId = "550e8400-e29b-41d4-a716-446655440000";

    public Task<Result> UpsertProductAsync(ProductDao product, CancellationToken ct = default) =>
        Task.FromResult(Result.Success());

    public Task<Result<ProductDao>> GetProductByIdAsync(string id, CancellationToken ct = default)
    {
        if (id == HardcodedProductId)
        {
            var product = new ProductDao(HardcodedProductId, "Sample Hardcoded Product");
            return Task.FromResult(Result<ProductDao>.Success(product));
        }

        return Task.FromResult(Result<ProductDao>.Failure(Errors.NotFound.Entity("Product", id)));
    }
}
