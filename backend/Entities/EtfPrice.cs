
using System.Text.Json;

public class EtfPrice
{
    public string Symbol { get; set; } = "";
    public string Name { get; set; } = "";
    
    // JSON completo devolvido pela API Finnhub.
    public JsonElement Data { get; set; }
}