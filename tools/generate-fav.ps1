# Generate favicons and apple touch icon from an existing image in images/
Param(
    [string]$SourceImage = "images\project5.png"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Get-SourceImagePath {
    param([string]$candidate)
    if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }
    $fallback = Get-ChildItem images -File -Include *.png,*.jpg,*.jpeg | Select-Object -First 1
    if ($null -ne $fallback) { return $fallback.FullName }
    throw "No suitable source image found in images/"
}

$srcPath = Get-SourceImagePath -candidate $SourceImage
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

# Helper to save resized PNG
function Save-Png {
    param([System.Drawing.Image]$img, [int]$size, [string]$outPath)
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

    # Fit center-crop to square
    $scale = [Math]::Max($size / $img.Width, $size / $img.Height)
    $newW = [int]([Math]::Ceiling($img.Width * $scale))
    $newH = [int]([Math]::Ceiling($img.Height * $scale))
    $dx = -[int](($newW - $size) / 2)
    $dy = -[int](($newH - $size) / 2)

    $destRect = New-Object System.Drawing.Rectangle $dx, $dy, $newW, $newH
    $g.DrawImage($img, $destRect)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

# 32x32 and 16x16
Save-Png -img $srcImg -size 32 -outPath 'favicon-32x32.png'
Save-Png -img $srcImg -size 16 -outPath 'favicon-16x16.png'
# Apple touch icon 180x180
Save-Png -img $srcImg -size 180 -outPath 'apple-touch-icon.png'

# ICO from 32x32
$icoBmp = New-Object System.Drawing.Bitmap 32, 32
$g2 = [System.Drawing.Graphics]::FromImage($icoBmp)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$src32 = [System.Drawing.Image]::FromFile('favicon-32x32.png')
$g2.DrawImage($src32, 0, 0, 32, 32)
$g2.Dispose()
$icon = [System.Drawing.Icon]::FromHandle($icoBmp.GetHicon())
$fs = [System.IO.File]::Open('favicon.ico','Create')
$icon.Save($fs)
$fs.Close()
$src32.Dispose()
$icoBmp.Dispose()

# Copy svg to root if present
if (Test-Path 'images\favicon.svg') { Copy-Item -Force 'images\favicon.svg' 'favicon.svg' }

$srcImg.Dispose()
Write-Host "Favicons generated: favicon-16x16.png, favicon-32x32.png, favicon.ico, apple-touch-icon.png, favicon.svg (optional)"
