# Serveur HTTP simple pour Angular
$port = 4200
$path = "C:\Users\adraouil\The-Nutritionist-AI\frontend-angular\dashboard\static-4200"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "🚀 Serveur Frontend lancé sur http://localhost:$port" -ForegroundColor Green
Write-Host "Dossier: $path" -ForegroundColor Cyan

while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $requestPath = $request.Url.LocalPath
    if ($requestPath -eq "/") { $requestPath = "/index.html" }
    
    $filePath = Join-Path $path $requestPath.TrimStart("/")
    
    try {
        if (Test-Path $filePath) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            
            # Déterminer le type MIME
            $ext = [System.IO.Path]::GetExtension($filePath)
            switch ($ext) {
                ".html" { $response.ContentType = "text/html" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "text/plain" }
            }
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # Si le fichier n'existe pas, servir index.html (pour Angular routing)
            $indexPath = Join-Path $path "index.html"
            if (Test-Path $indexPath) {
                $bytes = [System.IO.File]::ReadAllBytes($indexPath)
                $response.ContentLength64 = $bytes.Length
                $response.ContentType = "text/html"
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
        }
    } catch {
        $response.StatusCode = 500
    }
    
    $response.OutputStream.Close()
}
