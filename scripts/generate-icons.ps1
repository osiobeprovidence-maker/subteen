Add-Type -AssemblyName System.Drawing

$OutDir = Join-Path $PSScriptRoot '..\public\icons'
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

function New-RoundedRectPath([int]$w, [int]$h, [int]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $radius
  $path.AddArc(0, 0, $d, $d, 180, 90)
  $path.AddArc($w - $d, 0, $d, $d, 270, 90)
  $path.AddArc($w - $d, $h - $d, $d, $d, 0, 90)
  $path.AddArc(0, $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Icon([string]$fileName, [int]$size, [bool]$rounded) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $lime = [System.Drawing.Color]::FromArgb(255, 184, 255, 77)
  $limeBrush = New-Object System.Drawing.SolidBrush($lime)
  $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)

  if ($rounded) {
    $r = [int][math]::Round($size * 0.21875)
    $g.FillPath($limeBrush, (New-RoundedRectPath $size $size $r))
  } else {
    $g.FillRectangle($limeBrush, 0, 0, $size, $size)
  }

  $fontSize = [single]($size * 0.5625)
  $font = $null
  try {
    $font = New-Object System.Drawing.Font('Arial Black', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  } catch {
    $font = New-Object System.Drawing.Font('Arial', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  }

  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $g.DrawString('S', $font, $blackBrush, $rect, $fmt)

  $font.Dispose()
  $blackBrush.Dispose()
  $limeBrush.Dispose()
  $g.Dispose()
  $path = Join-Path $OutDir $fileName
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "wrote $path"
}

New-Icon 'icon-512.png' 512 $true
New-Icon 'icon-192.png' 192 $true
New-Icon 'icon-512-maskable.png' 512 $false
New-Icon 'icon-192-maskable.png' 192 $false
New-Icon 'apple-touch-icon.png' 180 $false
