# Webora Native PowerShell Web Server
# Run this script to preview the website locally on http://localhost:8000

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=============================================="
    Write-Host "  Webora Server Running on http://localhost:$port"
    Write-Host "  Press Ctrl+C in this terminal to stop serving"
    Write-Host "=============================================="
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Determine local path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq '/' -or $urlPath -eq '') {
            $urlPath = '/index.html'
        }
        $localPath = Join-Path $pwd $urlPath.TrimStart('/')
        
        # Resolve folder to index.html if it points to a directory
        if (Test-Path $localPath -PathType Container) {
            $localPath = Join-Path $localPath 'index.html'
        }
        
        if (Test-Path $localPath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "text/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $urlPath")
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error starting/running server: $_"
} finally {
    if ($listener) {
        $listener.Close()
    }
}
