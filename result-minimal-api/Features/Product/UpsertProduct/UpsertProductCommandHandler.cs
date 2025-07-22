using result_minimal_api.Core.Common;
using result_minimal_api.Core.Storage.Product;

namespace result_minimal_api.Features.Product.UpsertProduct;

public record UpsertProductCommand(UpsertProductRequestDto Dto);

public interface IUpsertProductCommandHandler
{
    Task<Result<UpsertProductResponseDto>> HandleAsync(UpsertProductCommand command, CancellationToken cancellationToken);
}

public class UpsertProductCommandHandler(IProductRepository productRepository) : IUpsertProductCommandHandler
{
    public async Task<Result<UpsertProductResponseDto>> HandleAsync(
        UpsertProductCommand command,
        CancellationToken ct)
    {
        var (Id, Name) = command.Dto;
        var productId = string.IsNullOrWhiteSpace(Id) ? Guid.NewGuid().ToString() : Id;

        var result = await productRepository.UpsertProductAsync(new ProductDao(productId, Name), ct);

        return result.Match(
            onSuccess: () => Result<UpsertProductResponseDto>.Success(new UpsertProductResponseDto(productId)),
            onFailure: error => Result<UpsertProductResponseDto>.Failure(error!)
        );
    }
}
