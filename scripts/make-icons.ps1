# Generates the web logo, favicons, app icons and the fallback share image from
# assets/logo-source.png (transparent PNG lockup: emblem on the left, wordmark on the right).
# Windows only (System.Drawing). Run: npm run icons
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$pub = Join-Path $root 'public'
$source = Join-Path $root 'assets\logo-source.png'

$navy = [System.Drawing.Color]::FromArgb(8, 18, 29)
$navy2 = [System.Drawing.Color]::FromArgb(22, 40, 60)
$muted = [System.Drawing.Color]::FromArgb(163, 175, 187)
$green = [System.Drawing.Color]::FromArgb(37, 211, 102)
$greenInk = [System.Drawing.Color]::FromArgb(3, 33, 15)

$logo = [System.Drawing.Bitmap]::FromFile($source)

# Bounding box of visible pixels
function Get-Bounds($bmp, [int]$x0, [int]$x1) {
  $minX = $x1; $minY = $bmp.Height; $maxX = $x0; $maxY = 0
  for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = $x0; $x -lt $x1; $x += 2) {
      if ($bmp.GetPixel($x, $y).A -gt 16) {
        if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $pad = 4
  $minX = [math]::Max(0, $minX - $pad); $minY = [math]::Max(0, $minY - $pad)
  $maxX = [math]::Min($bmp.Width - 1, $maxX + $pad); $maxY = [math]::Min($bmp.Height - 1, $maxY + $pad)
  return New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
}

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'; $g.CompositingQuality = 'HighQuality'
  return @($bmp, $g)
}

# 1. Full lockup for header/footer: trimmed, 100px tall (sharp at 2x for 36-50px display)
$full = Get-Bounds $logo 0 $logo.Width
$h = 100; $w = [int][math]::Round($full.Width * $h / $full.Height)
$c = New-Canvas $w $h
$c[1].Clear([System.Drawing.Color]::Transparent)
$c[1].DrawImage($logo, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $full, [System.Drawing.GraphicsUnit]::Pixel)
$c[0].Save((Join-Path $pub 'images\logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()
Write-Output "images/logo.png ${w}x${h}"

# 2. Emblem (sun, palm, minivan, wave) = left part of the lockup
$emblemRight = [int]($logo.Width * 0.245)
$em = Get-Bounds $logo 0 $emblemRight
$side = [math]::Max($em.Width, $em.Height)
$emSquare = New-Object System.Drawing.Rectangle(($em.X - [int](($side - $em.Width) / 2)), ($em.Y - [int](($side - $em.Height) / 2)), $side, $side)

function Save-Icon([int]$size, [string]$name, [bool]$background, [double]$inset) {
  $c = New-Canvas $size $size
  if ($background) { $c[1].Clear($navy) } else { $c[1].Clear([System.Drawing.Color]::Transparent) }
  $pad = [int]($size * $inset); $inner = $size - 2 * $pad
  $c[1].DrawImage($logo, (New-Object System.Drawing.Rectangle($pad, $pad, $inner, $inner)), $emSquare, [System.Drawing.GraphicsUnit]::Pixel)
  $c[0].Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $c[1].Dispose(); $c[0].Dispose()
  Write-Output "$name ${size}x${size}"
}
Save-Icon 32 'favicon-32.png' $false 0.0
Save-Icon 180 'apple-touch-icon.png' $true 0.08
Save-Icon 192 'icon-192.png' $true 0.08
Save-Icon 512 'icon-512.png' $true 0.08

# 3. Fallback social share image 1200x630 (used only when public/images/og.jpg is missing)
$W = 1200; $H = 630
$c = New-Canvas $W $H; $g = $c[1]
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Rectangle(0, 0, $W, $H)), $navy2, $navy, 35)
$g.FillRectangle($bg, 0, 0, $W, $H)
$lw = 1000; $lh = [int][math]::Round($full.Height * $lw / $full.Width)
$g.DrawImage($logo, (New-Object System.Drawing.Rectangle(100, 90, $lw, $lh)), $full, [System.Drawing.GraphicsUnit]::Pixel)
$u = [char]0x00FA; $dot = [char]0x00B7
$fSub = New-Object System.Drawing.Font('Segoe UI', 32, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fmt = New-Object System.Drawing.StringFormat; $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
$g.DrawString("Private taxi $dot Cabarete $dot Sos${u}a $dot Puerto Plata $dot 24/7", $fSub, (New-Object System.Drawing.SolidBrush($muted)), (New-Object System.Drawing.RectangleF(0, (100 + $lh), $W, 70)), $fmt)
$pw = 560; $px = [int](($W - $pw) / 2); $py = 470
$pill = New-Object System.Drawing.Drawing2D.GraphicsPath
$pill.AddArc($px, $py, 72, 72, 90, 180); $pill.AddArc(($px + $pw - 72), $py, 72, 72, 270, 180); $pill.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush($green)), $pill)
$fPill = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('WhatsApp  +1 829-929-5355', $fPill, (New-Object System.Drawing.SolidBrush($greenInk)), (New-Object System.Drawing.RectangleF($px, $py, $pw, 72)), $fmt)
$c[0].Save((Join-Path $pub 'og-default.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $c[0].Dispose()
Write-Output 'og-default.png 1200x630'

$logo.Dispose()
