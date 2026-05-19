$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:9234/")
$listener.Start()
Write-Host "Server running at http://localhost:9234/"
Write-Host "Press Ctrl+C to stop."

$root = "C:\Users\hp\OneDrive\Desktop\kova-carousel"

$mimeTypes = @{}
$mimeTypes[".html"] = "text/html; charset=utf-8"
$mimeTypes[".png"] = "image/png"
$mimeTypes[".css"] = "text/css"
$mimeTypes[".js"] = "application/javascript"
$mimeTypes[".md"] = "text/plain"
$mimeTypes[".jpg"] = "image/jpeg"
$mimeTypes[".jpeg"] = "image/jpeg"
$mimeTypes[".svg"] = "image/svg+xml"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.LocalPath

    if ($requestPath -eq "/") {
        $requestPath = "/index.html"
    }

    $filePath = Join-Path $root ($requestPath.TrimStart("/"))

    if (Test-Path $filePath) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = "application/octet-stream"
        if ($mimeTypes.ContainsKey($ext)) {
            $contentType = $mimeTypes[$ext]
        }
        $context.Response.ContentType = $contentType
        $context.Response.StatusCode = 200
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("File not found")
        $context.Response.ContentLength64 = $msg.Length
        $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }

    $context.Response.Close()
}
