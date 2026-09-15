# Generates favicon PNGs, app icons and the default social share image into public/.
# Windows only (System.Drawing). Run: npm run icons
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$pub = Join-Path $PSScriptRoot '..\public'

$navy  = [System.Drawing.Color]::FromArgb(8, 18, 29)
$navy2 = [System.Drawing.Color]::FromArgb(22, 40, 60)
$gold  = [System.Drawing.Color]::FromArgb(217, 180, 106)
$gold2 = [System.Drawing.Color]::FromArgb(241, 214, 159)
$ink   = [System.Drawing.Color]::FromArgb(27, 19, 7)
$cream = [System.Drawing.Color]::FromArgb(246, 243, 236)
$muted = [System.Drawing.Color]::FromArgb(163, 175, 187)
$green = [System.Drawing.Color]::FromArgb(37, 211, 102)
$greenInk = [System.Drawing.Color]::FromArgb(3, 33, 15)

function New-RoundRect([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.InterpolationMode = 'HighQualityBicubic'
  return @($bmp, $g)
}

function Draw-Mark($g, [single]$x, [single]$y, [single]$size, [bool]$fullBleed) {
  $rect = New-Object System.Drawing.RectangleF($x, $y, $size, $size)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $gold2, $gold, 45)
  if ($fullBleed) { $g.FillRectangle($brush, $rect) }
  else { $g.FillPath($brush, (New-RoundRect $x $y $size $size ($size * 0.28))) }
  $font = New-Object System.Drawing.Font('Segoe UI', ($size * 0.36), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $g.DrawString('DR', $font, (New-Object System.Drawing.SolidBrush($ink)), $rect, $fmt)
}

function Save-Icon([int]$size, [string]$name, [bool]$fullBleed) {
  $c = New-Canvas $size $size
  if (-not $fullBleed) { $c[1].Clear([System.Drawing.Color]::Transparent) }
  Draw-Mark $c[1] 0 0 $size $fullBleed
  $c[0].Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $c[1].Dispose(); $c[0].Dispose()
}

Save-Icon 32 'favicon-32.png' $false
Save-Icon 180 'apple-touch-icon.png' $true
Save-Icon 192 'icon-192.png' $true
Save-Icon 512 'icon-512.png' $true

# Social share image 1200x630
$W = 1200; $H = 630
$c = New-Canvas $W $H
$g = $c[1]
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Rectangle(0, 0, $W, $H)), $navy2, $navy, 35)
$g.FillRectangle($bg, 0, 0, $W, $H)
$glow = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow.AddEllipse(700, -260, 760, 620)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(70, 217, 180, 106)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 217, 180, 106))
$g.FillPath($pgb, $glow)

Draw-Mark $g 80 80 88 $false
$fBrand = New-Object System.Drawing.Font('Segoe UI', 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('My DR', $fBrand, (New-Object System.Drawing.SolidBrush($cream)), 186, 96)
$myW = $g.MeasureString('My DR ', $fBrand).Width
$g.DrawString('Taxi', $fBrand, (New-Object System.Drawing.SolidBrush($gold)), (186 + $myW - 10), 96)

$u = [char]0x00FA; $dot = [char]0x00B7
$fH1 = New-Object System.Drawing.Font('Segoe UI', 76, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Your private driver', $fH1, (New-Object System.Drawing.SolidBrush($cream)), 72, 220)
$g.DrawString('in the Dominican Republic.', $fH1, (New-Object System.Drawing.SolidBrush($cream)), 72, 308)

$fSub = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString("Cabarete $dot Sos${u}a $dot Puerto Plata $dot POP $dot STI $dot SDQ $dot PUJ", $fSub, (New-Object System.Drawing.SolidBrush($muted)), 80, 420)

$pill = New-RoundRect 80 500 560 72 36
$g.FillPath((New-Object System.Drawing.SolidBrush($green)), $pill)
$fPill = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
$g.DrawString('WhatsApp  +1 829-929-5355', $fPill, (New-Object System.Drawing.SolidBrush($greenInk)), (New-Object System.Drawing.RectangleF(80, 500, 560, 72)), $fmt)

$fTag = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString("24/7 $dot Meet & greet $dot Wi-Fi $dot Up to 6", $fTag, (New-Object System.Drawing.SolidBrush($gold)), 680, 520)

$c[0].Save((Join-Path $pub 'og-default.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $c[0].Dispose()
Write-Output 'Icons and og-default.png written to public/'
