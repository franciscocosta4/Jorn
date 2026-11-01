using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Text.Json;
using backend.Configuration;


namespace backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FinnhubController : ControllerBase
    {

        private readonly HttpClient _httpClient;
        private readonly ILogger<FinnhubController> _logger;
        private readonly string _apiKey;


        public FinnhubController(
            HttpClient httpClient,
            IOptions<ApiSettings> apiSettings,
            ILogger<FinnhubController> logger)
        {
            // Recebe a instância de HttpClient através de Dependency Injection.
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = apiSettings.Value.ApiKey;
        }

        private readonly Dictionary<string, string> _etfs = new()
        {
            { "SPY", "SPDR S&P 500 ETF Trust" },
            { "VOO", "Vanguard S&P 500 ETF" },
            { "IVV", "iShares Core S&P 500 ETF" },
            { "QQQ", "Invesco QQQ Trust" },
            { "VTI", "Vanguard Total Stock Market ETF" },
            { "SCHD", "Schwab US Dividend Equity ETF" },
            { "IWM", "iShares Russell 2000 ETF" },
            { "DIA", "SPDR Dow Jones Industrial Average ETF" },
            { "GLD", "SPDR Gold Shares" },
            { "TLT", "iShares 20+ Year Treasury Bond ETF" }
        };


        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetEtfPrices(CancellationToken cancellationToken)
        {
        // Lista onde vamos guardar os preços dos ETFs.
        var results = new List<EtfPrice>();

        // Percorre todos os ETFs definidos no dicionário.
        foreach (var etf in _etfs)
        {
            // Constrói o URL para consultar o ticker actual.
            // var url = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={etf.Key}&apikey={_apiKey}";
            var url = $"https://finnhub.io/api/v1/quote?symbol={Uri.EscapeDataString(etf.Key)}&token={Uri.EscapeDataString(_apiKey)}";

            // Executa o pedido GET.
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.LogError("A Finnhub rejeitou a ApiSettings:ApiKey.");
                return Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Falha na autenticação com o serviço Finnhub.",
                    detail: "Verifica se a chave Finnhub configurada é válida.");
            }

            // Verifica se o pedido HTTP foi bem sucedido.
            response.EnsureSuccessStatusCode();

            // Lê a resposta JSON.
            var json = await response.Content.ReadAsStringAsync(cancellationToken);

            // Converte o JSON numa estrutura JSON genérica.
            using var document = JsonDocument.Parse(json);

            // Adiciona o ETF e o respectivo preço à lista.
            results.Add(new EtfPrice
            {
                Symbol = etf.Key,
                Name = etf.Value,
                Data = document.RootElement.Clone()
            });
        }

        // Devolve todos os resultados.
        return Ok(results);
    }


        
    }
}
