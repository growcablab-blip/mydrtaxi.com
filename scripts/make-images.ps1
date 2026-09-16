# Generates optimized site photography from the source PNGs in assets/photos/ (not deployed):
# JPEG masters + smaller srcset variants in public/images/, the driver-strip avatar and the
# 1200x630 social share image (og.jpg, cropped from the Winton-driving hero).
# Windows only (System.Drawing). Run: npm run images
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$src = Join-Path $root 'assets\photos'
$out = Join-Path $root 'public\images'

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg([System.Drawing.Image]$img, [System.Drawing.Rectangle]$crop, [int]$w, [int]$h, [string]$rel, [long]$quality) {
  $path = Join-Path $out $rel
  $dir = Split-Path $path -Parent
  if (-not (Test-Path $dir)) { [void][System.IO.Directory]::CreateDirectory($dir) }
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'; $g.SmoothingMode = 'HighQuality'
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
  $bmp.Save($path, $jpeg, $ep); $bmp.Dispose()
  Write-Output ('{0,-40} {1,5}x{2,-5} {3,5:N0} KB' -f $rel, $w, $h, ((Get-Item $path).Length / 1KB))
}

# source PNG -> output base name (in public/images), widths (first = master), JPEG quality
$jobs = @(
  @{ src = 'winton-driving.png';      out = 'winton-driving.jpg';                widths = @(1672, 960);  q = 86 },
  @{ src = 'meet-winton.png';         out = 'meet-winton.jpg';                   widths = @(1536, 800);  q = 86 },
  @{ src = 'airport-pop.png';         out = 'airports/airport-pop.jpg';          widths = @(1024, 600);  q = 86 },
  @{ src = 'airport-sti.png';         out = 'airports/airport-sti.jpg';          widths = @(1024, 600);  q = 86 },
  @{ src = 'airport-sdq.png';         out = 'airports/airport-sdq.jpg';          widths = @(1024, 600);  q = 86 },
  @{ src = 'airport-puj.png';         out = 'airports/airport-puj.jpg';          widths = @(1024, 600);  q = 86 },
  @{ src = 'vehicle-exterior.png';    out = 'vehicle/vehicle-exterior.jpg';      widths = @(1448, 800);  q = 86 },
  @{ src = 'vehicle-interior.png';    out = 'vehicle/vehicle-interior.jpg';      widths = @(1448, 800);  q = 86 },
  @{ src = 'cta-airport-arrival.png'; out = 'cta/cta-airport-arrival.jpg';       widths = @(1672, 1100); q = 84 }
)

foreach ($job in $jobs) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $src $job.src))
  $full = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)
  $first = $true
  foreach ($w in $job.widths) {
    $h = [int][math]::Round($img.Height * $w / $img.Width)
    $rel = if ($first) { $job.out } else { $job.out -replace '\.jpg$', "-$w.jpg" }
    $q = if ($first) { [long]$job.q } else { [long]($job.q - 2) }
    Save-Jpeg $img $full $w $h $rel $q
    $first = $false
  }
  $img.Dispose()
}

# Driver-strip avatar + social share image, both from the Winton-driving hero
$hero = [System.Drawing.Image]::FromFile((Join-Path $src 'winton-driving.png'))   # 1672x941
Save-Jpeg $hero (New-Object System.Drawing.Rectangle(555, 355, 240, 240)) 240 240 'winton-avatar.jpg' 88
Save-Jpeg $hero (New-Object System.Drawing.Rectangle(0, 32, 1672, 878)) 1200 630 'og.jpg' 86   # face, driver window and minivan
$hero.Dispose()
