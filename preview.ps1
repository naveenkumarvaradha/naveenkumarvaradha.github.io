<#
.SYNOPSIS
    Tiny static file server for previewing the portfolio locally - no Node/Python needed.

.EXAMPLE
    .\preview.ps1
.EXAMPLE
    .\preview.ps1 -Port 8080
#>
param(
    [int]$Port = 0
)

$root = $PSScriptRoot
$mime = @{
  '.html' = 'text/html'; '.css' = 'text/css'; '.js' = 'application/javascript'
  '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.pdf' = 'application/pdf'; '.ico' = 'image/x-icon'
}

# Ports to try, in order. If -Port was given, try only that one.
$candidates = if ($Port -gt 0) { @($Port) } else { 5500, 5551, 5673, 8123, 8890, 9317 }

$listener = $null
$boundPort = $null

foreach ($p in $candidates) {
    $try = New-Object System.Net.HttpListener
    $try.Prefixes.Add("http://localhost:$p/")
    try {
        $try.Start()
        $listener = $try
        $boundPort = $p
        break
    } catch {
        Write-Host "port $p unavailable ($($_.Exception.Message.Trim())), trying next..." -ForegroundColor DarkGray
        $try.Close()
    }
}

if (-not $listener) {
    Write-Host "`nCouldn't bind any of: $($candidates -join ', ')." -ForegroundColor Red
    Write-Host "Something else already owns all of them. Try: .\preview.ps1 -Port <free-port-number>`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nServing $root" -ForegroundColor Green
Write-Host "  -> http://localhost:$boundPort/`n" -ForegroundColor Green
Write-Host "Ctrl+C to stop.`n" -ForegroundColor DarkGray

try {
    while ($listener.IsListening) {
      $ctx = $listener.GetContext()
      $req = $ctx.Request
      $res = $ctx.Response
      $path = $req.Url.LocalPath
      if ($path -eq '/') { $path = '/index.html' }
      $file = Join-Path $root ($path.TrimStart('/'))
      if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file)
        $ct = $mime[$ext]
        if (-not $ct) { $ct = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $res.ContentType = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 not found: $path")
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      $res.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
