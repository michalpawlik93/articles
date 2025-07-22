
namespace result_minimal_api.Core.Common;

public sealed class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }

    private Result(bool isSuccess, Error? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(Error error) => new(false, error);

    public void Match(Action onSuccess, Action<Error> onFailure)
    {
        if (IsSuccess) onSuccess();
        else onFailure(Error!);
    }

    public T Match<T>(Func<T> onSuccess, Func<Error, T> onFailure)
    {
        return IsSuccess ? onSuccess() : onFailure(Error!);
    }
}

public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public Error? Error { get; }

    private Result(T? value, bool isSuccess, Error? error)
    {
        Value = value;
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result<T> Success(T value) => new(value, true, null);
    public static Result<T> Failure(Error error) => new(default, false, error);

    public void Match(Action<T> onSuccess, Action<Error> onFailure)
    {
        if (IsSuccess) onSuccess(Value!);
        else onFailure(Error!);
    }

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Error, TResult> onFailure)
    {
        return IsSuccess ? onSuccess(Value!) : onFailure(Error!);
    }

    public Result<TOut> Map<TOut>(Func<T, TOut> map)
    {
        return IsSuccess
            ? Result<TOut>.Success(map(Value!))
            : Result<TOut>.Failure(Error!);
    }
}
