namespace result_minimal_api.Core.Common;


public sealed record Error(ErrorType Type, string Code, string Message)
{
    public override string ToString() => $"{Type}:{Code} - {Message}";

    public static Error Create(ErrorType type, string code, string message) =>
        new(type, code, message);
}

public enum ErrorType
{
    General,
    NotFound,
}




public static class Errors
{
    public static class General
    {
        public static readonly Error Unknown =
            Error.Create(ErrorType.General, "Unknown", "An unknown error occurred.");
    }

    public static class NotFound
    {
        public static Error Entity(string entityName, object key) =>
            Error.Create(ErrorType.NotFound, "EntityNotFound", $"{entityName} with ID '{key}' was not found.");
    }
}
