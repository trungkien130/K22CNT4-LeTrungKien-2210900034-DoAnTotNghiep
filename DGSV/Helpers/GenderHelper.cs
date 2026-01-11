namespace DGSV.Api.Helpers
{
    public static class GenderHelper
    {
        public static bool? ParseGender(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            value = value.Trim().ToLower();

            if (value == "nam" || value == "n" || value == "male" || value == "m")
                return true;

            if (value == "nữ" || value == "nu" || value == "female" || value == "f")
                return false;

            return null;
        }
    }
}
