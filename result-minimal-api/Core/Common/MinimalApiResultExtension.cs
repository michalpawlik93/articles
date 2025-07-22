namespace result_minimal_api.Core.Common;

public static class ResultExtensions
{
    private const string _defaultFailureMessage = "An unexpected error occurred.";

    public static IResult ToMinimalApiResult<T>(this Result<T> result, string? failureMessage = null)
    {
        if (result.IsSuccess && result.Value is not null)
        {
            return Results.Ok(result.Value);
        }

        if (result.Error is not null)
        {
            return result.Error.Type switch
            {
                ErrorType.NotFound => Results.NoContent(),
                ErrorType.General => Results.Problem(result.Error.Message),
                _ => Results.Problem(failureMessage ?? _defaultFailureMessage)
            };
        }

        return Results.Problem(failureMessage ?? _defaultFailureMessage);
    }

    public static IResult ToMinimalApiResult(this Result result, string? failureMessage = null)
    {
        if (result.IsSuccess)
        {
            return Results.Ok();
        }

        if (result.Error is not null)
        {
            return result.Error.Type switch
            {
                ErrorType.NotFound => Results.NoContent(),
                ErrorType.General => Results.Problem(result.Error.Message),
                _ => Results.Problem(failureMessage ?? _defaultFailureMessage)
            };
        }

        return Results.Problem(failureMessage ?? _defaultFailureMessage);
    }
}
