Add-Type -AssemblyName System.Drawing

$fontDir = "C:\Users\hp\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\5903f9e9-0b11-4c5e-9f70-c7829cab9f3e\d3b5af8b-5a58-46f1-8bce-d3e76c367665\skills\canvas-design\canvas-fonts"
$outDir = "C:\Users\hp\OneDrive\Desktop\kova-carousel"

# Load custom fonts
$fontCollection = New-Object System.Drawing.Text.PrivateFontCollection
$fontCollection.AddFontFile("$fontDir\Outfit-Regular.ttf")
$fontCollection.AddFontFile("$fontDir\Outfit-Bold.ttf")

$W = 1080
$H = 1080

# Brand colors
$purple = [System.Drawing.Color]::FromArgb(91, 43, 232)
$purpleHover = [System.Drawing.Color]::FromArgb(74, 31, 203)
$purpleTint = [System.Drawing.Color]::FromArgb(239, 231, 255)
$purpleSoft = [System.Drawing.Color]::FromArgb(122, 83, 240)
$teal = [System.Drawing.Color]::FromArgb(13, 148, 136)
$white = [System.Drawing.Color]::White
$slate50 = [System.Drawing.Color]::FromArgb(248, 250, 252)
$slate100 = [System.Drawing.Color]::FromArgb(241, 245, 249)
$slate200 = [System.Drawing.Color]::FromArgb(226, 232, 240)
$slate400 = [System.Drawing.Color]::FromArgb(148, 163, 184)
$slate500 = [System.Drawing.Color]::FromArgb(100, 116, 139)
$slate600 = [System.Drawing.Color]::FromArgb(71, 85, 105)
$slate800 = [System.Drawing.Color]::FromArgb(30, 41, 59)
$slate900 = [System.Drawing.Color]::FromArgb(15, 23, 42)

# Helper: get font
function Get-Font($size, [string]$style = "Regular") {
    $fs = [System.Drawing.FontStyle]::Regular
    if ($style -eq "Bold") { $fs = [System.Drawing.FontStyle]::Bold }
    try {
        $family = $fontCollection.Families | Where-Object { $_.Name -like "*Outfit*" } | Select-Object -First 1
        if ($family) {
            return New-Object System.Drawing.Font($family, $size, $fs, [System.Drawing.GraphicsUnit]::Pixel)
        }
    } catch {}
    $fallback = if ($style -eq "Bold") { "Segoe UI" } else { "Segoe UI" }
    return New-Object System.Drawing.Font($fallback, $size, $fs, [System.Drawing.GraphicsUnit]::Pixel)
}

# Helper: draw centered text
function Draw-CenteredText($g, $text, $font, $brush, $y, $maxWidth = 900) {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
    $sf.Trimming = [System.Drawing.StringTrimming]::Word
    [float]$rx = ([float]$W - [float]$maxWidth) / 2.0
    [float]$ry = [float]$y
    [float]$rw = [float]$maxWidth
    [float]$rh = 600.0
    $rect = New-Object System.Drawing.RectangleF($rx, $ry, $rw, $rh)
    $g.DrawString([string]$text, $font, $brush, $rect, $sf)
    $sf.Dispose()
}

# Helper: draw left-aligned text
function Draw-LeftText($g, $text, $font, $brush, $x, $y, $maxWidth = 800) {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Near
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
    $sf.Trimming = [System.Drawing.StringTrimming]::Word
    [float]$rx = [float]$x
    [float]$ry = [float]$y
    [float]$rw = [float]$maxWidth
    [float]$rh = 600.0
    $rect = New-Object System.Drawing.RectangleF($rx, $ry, $rw, $rh)
    $g.DrawString([string]$text, $font, $brush, $rect, $sf)
    $sf.Dispose()
}

# Helper: measure text height
function Measure-TextHeight($g, $text, $font, $maxWidth = 900) {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Trimming = [System.Drawing.StringTrimming]::Word
    $size = $g.MeasureString($text, $font, $maxWidth, $sf)
    $sf.Dispose()
    return $size.Height
}

# Helper: draw rounded rect
function Draw-RoundedRect($g, $brush, $x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
    $path.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
    $path.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $path.Dispose()
}

# Helper: draw rounded rect outline
function Draw-RoundedRectOutline($g, $pen, $x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
    $path.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
    $path.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()
    $g.DrawPath($pen, $path)
    $path.Dispose()
}

# Helper: create new slide bitmap
function New-Slide() {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $bmp.SetResolution(144, 144)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    return @{ Bitmap = $bmp; Graphics = $g }
}

# Helper: save and dispose
function Save-Slide($slide, $name) {
    $slide.Graphics.Dispose()
    $slide.Bitmap.Save("$outDir\$name", [System.Drawing.Imaging.ImageFormat]::Png)
    $slide.Bitmap.Dispose()
    Write-Host "Saved: $name"
}

# Helper: draw gradient background (diagonal 135deg purple to teal)
function Fill-GradientBg($g) {
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($W, $H)),
        $purple,
        $teal
    )
    $g.FillRectangle($gradBrush, 0, 0, $W, $H)
    $gradBrush.Dispose()
}

# Helper: draw subtle decorative circles
function Draw-DecoCircles($g, [System.Drawing.Color]$color, $alpha = 15) {
    $c = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
    $b = New-Object System.Drawing.SolidBrush($c)
    $g.FillEllipse($b, -120, -120, 400, 400)
    $g.FillEllipse($b, 800, 700, 450, 450)
    $b.Dispose()
}

# Helper: draw slide number indicator
function Draw-SlideNumber($g, $current, $total, $lightMode = $true) {
    $dotSize = 8
    $dotSpacing = 20
    $totalWidth = ($total * $dotSize) + (($total - 1) * ($dotSpacing - $dotSize))
    [float]$startX = ([float]$W - [float]$totalWidth) / 2.0
    $y = $H - 60

    for ($i = 0; $i -lt $total; $i++) {
        $x = $startX + ($i * $dotSpacing)
        if ($i -eq ($current - 1)) {
            $dotBrush = if ($lightMode) { New-Object System.Drawing.SolidBrush($purple) } else { New-Object System.Drawing.SolidBrush($white) }
        } else {
            $alpha = if ($lightMode) { 80 } else { 100 }
            $baseColor = if ($lightMode) { $slate400 } else { $white }
            $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, $baseColor.R, $baseColor.G, $baseColor.B))
        }
        $g.FillEllipse($dotBrush, $x, $y, $dotSize, $dotSize)
        $dotBrush.Dispose()
    }
}

Write-Host "Generating Kova AI Instagram Carousel..."
Write-Host "========================================="

# ============================================================
# SLIDE 1 — HOOK / COVER
# ============================================================
$s = New-Slide
$g = $s.Graphics

# White background
$g.Clear($white)

# Subtle purple gradient overlay at top
$topGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, 400)),
    [System.Drawing.Color]::FromArgb(8, $purple.R, $purple.G, $purple.B),
    [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
)
$g.FillRectangle($topGrad, 0, 0, $W, 400)
$topGrad.Dispose()

# Decorative elements - subtle circles
Draw-DecoCircles $g $purple 10
$tealCircle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, $teal.R, $teal.G, $teal.B))
$g.FillEllipse($tealCircle, 650, -50, 300, 300)
$tealCircle.Dispose()

# Small "KOVA" eyebrow label
$eyebrowFont = Get-Font 16 "Bold"
$eyebrowBrush = New-Object System.Drawing.SolidBrush($purple)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("KOVA", $eyebrowFont, $eyebrowBrush, [float]($W / 2), [float]320, $sf)

# Purple accent line under eyebrow
$linePen = New-Object System.Drawing.Pen($purple, 2)
$g.DrawLine($linePen, [int]($W/2 - 20), [int]345, [int]($W/2 + 20), [int]345)
$linePen.Dispose()

# Main tagline — big and bold
$taglineFont = Get-Font 72 "Bold"
$taglineBrush = New-Object System.Drawing.SolidBrush($slate900)
Draw-CenteredText $g "Sell on WhatsApp." $taglineFont $taglineBrush 380 800

# Second line with purple
$tagline2Font = Get-Font 72 "Bold"
$tagline2Brush = New-Object System.Drawing.SolidBrush($purple)
Draw-CenteredText $g "Without typing." $tagline2Font $tagline2Brush 470 800

# Subtitle
$subFont = Get-Font 22 "Regular"
$subBrush = New-Object System.Drawing.SolidBrush($slate500)
Draw-CenteredText $g "AI-powered WhatsApp sales for your business" $subFont $subBrush 590 700

# Small gradient bar at bottom
$bottomGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(340, 0)),
    (New-Object System.Drawing.Point(740, 0)),
    $purple,
    $teal
)
$g.FillRectangle($bottomGrad, 390, 660, 300, 4)
$bottomGrad.Dispose()

Draw-SlideNumber $g 1 7 $true

# Cleanup
$eyebrowFont.Dispose(); $eyebrowBrush.Dispose(); $sf.Dispose()
$taglineFont.Dispose(); $taglineBrush.Dispose()
$tagline2Font.Dispose(); $tagline2Brush.Dispose()
$subFont.Dispose(); $subBrush.Dispose()

Save-Slide $s "slide-01-cover.png"


# ============================================================
# SLIDE 2 — THE PROBLEM
# ============================================================
$s = New-Slide
$g = $s.Graphics

# Dark background
$g.Clear($slate900)

# Subtle gradient overlay
$overlay = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($W, $H)),
    [System.Drawing.Color]::FromArgb(30, $purple.R, $purple.G, $purple.B),
    [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
)
$g.FillRectangle($overlay, 0, 0, $W, $H)
$overlay.Dispose()

# Eyebrow
$eyeFont = Get-Font 14 "Bold"
$eyeBrush = New-Object System.Drawing.SolidBrush($teal)
$sf2 = New-Object System.Drawing.StringFormat
$sf2.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("THE PROBLEM", $eyeFont, $eyeBrush, [float]($W/2), [float]280, $sf2)

# Main headline
$headFont = Get-Font 56 "Bold"
$headBrush = New-Object System.Drawing.SolidBrush($white)
Draw-CenteredText $g "You're losing sales in your DMs." $headFont $headBrush 340 800

# Body points
$bodyFont = Get-Font 22 "Regular"
$bodyBrush = New-Object System.Drawing.SolidBrush($slate400)

$points = @(
    "Hours spent replying to the same questions",
    "Orders slipping through the cracks",
    "Customers waiting too long for replies"
)

$yPos = 560
foreach ($point in $points) {
    # Teal dot
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, $teal.R, $teal.G, $teal.B))
    $g.FillEllipse($dotBrush, 180, $yPos + 8, 10, 10)
    $dotBrush.Dispose()
    Draw-LeftText $g $point $bodyFont $bodyBrush 210 $yPos 700
    $yPos += 55
}

Draw-SlideNumber $g 2 7 $false

$eyeFont.Dispose(); $eyeBrush.Dispose(); $sf2.Dispose()
$headFont.Dispose(); $headBrush.Dispose()
$bodyFont.Dispose(); $bodyBrush.Dispose()

Save-Slide $s "slide-02-problem.png"


# ============================================================
# SLIDE 3 — WHAT IS KOVA
# ============================================================
$s = New-Slide
$g = $s.Graphics

$g.Clear($white)

# Purple tint background panel
Draw-RoundedRect $g (New-Object System.Drawing.SolidBrush($purpleTint)) 60 200 960 600 24

# Eyebrow
$eyeFont3 = Get-Font 14 "Bold"
$eyeBrush3 = New-Object System.Drawing.SolidBrush($purple)
$sf3 = New-Object System.Drawing.StringFormat
$sf3.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("INTRODUCING", $eyeFont3, $eyeBrush3, [float]($W/2), [float]250, $sf3)

# Main headline
$head3 = Get-Font 48 "Bold"
$headBr3 = New-Object System.Drawing.SolidBrush($slate900)
Draw-CenteredText $g "Meet Kova" $head3 $headBr3 300 800

# Purple subtitle
$sub3 = Get-Font 32 "Bold"
$subBr3 = New-Object System.Drawing.SolidBrush($purple)
Draw-CenteredText $g "Your AI WhatsApp Sales Agent" $sub3 $subBr3 380 800

# Body text
$body3 = Get-Font 22 "Regular"
$bodyBr3 = New-Object System.Drawing.SolidBrush($slate600)
Draw-CenteredText $g "Kova turns WhatsApp conversations into orders, bookings, and paid customers." $body3 $bodyBr3 480 750

# Second body line
Draw-CenteredText $g "Your team stays focused on fulfillment instead of repetitive replies." $body3 $bodyBr3 560 750

# Small teal accent bar
$tealBrush = New-Object System.Drawing.SolidBrush($teal)
$g.FillRectangle($tealBrush, [int]($W/2 - 30), [int]680, [int]60, [int]3)
$tealBrush.Dispose()

Draw-SlideNumber $g 3 7 $true

$eyeFont3.Dispose(); $eyeBrush3.Dispose(); $sf3.Dispose()
$head3.Dispose(); $headBr3.Dispose()
$sub3.Dispose(); $subBr3.Dispose()
$body3.Dispose(); $bodyBr3.Dispose()

Save-Slide $s "slide-03-what-is-kova.png"


# ============================================================
# SLIDE 4 — HOW IT WORKS
# ============================================================
$s = New-Slide
$g = $s.Graphics

$g.Clear($slate50)

# Eyebrow
$eyeFont4 = Get-Font 14 "Bold"
$eyeBrush4 = New-Object System.Drawing.SolidBrush($purple)
$sf4 = New-Object System.Drawing.StringFormat
$sf4.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("HOW IT WORKS", $eyeFont4, $eyeBrush4, [float]($W/2), [float]120, $sf4)

# Headline
$head4 = Get-Font 42 "Bold"
$headBr4 = New-Object System.Drawing.SolidBrush($slate900)
Draw-CenteredText $g "3 Steps to Go Live" $head4 $headBr4 160 800

# Step cards
$steps = @(
    @{ Num = "01"; Title = "Connect"; Desc = "Link your WhatsApp number. Keep your existing one." },
    @{ Num = "02"; Title = "Teach"; Desc = "Add your catalog, prices, FAQs, and policies." },
    @{ Num = "03"; Title = "Go Live"; Desc = "AI handles the rest. Your team retains control." }
)

$cardY = 290
foreach ($step in $steps) {
    # White card
    Draw-RoundedRect $g (New-Object System.Drawing.SolidBrush($white)) 100 $cardY 880 190 16

    # Card subtle border
    $borderPen = New-Object System.Drawing.Pen($slate200, 1)
    Draw-RoundedRectOutline $g $borderPen 100 $cardY 880 190 16
    $borderPen.Dispose()

    # Step number circle
    $numBrush = New-Object System.Drawing.SolidBrush($purple)
    $g.FillEllipse($numBrush, 140, ($cardY + 55), 70, 70)
    $numBrush.Dispose()

    $numFont = Get-Font 28 "Bold"
    $numTextBrush = New-Object System.Drawing.SolidBrush($white)
    $numSf = New-Object System.Drawing.StringFormat
    $numSf.Alignment = [System.Drawing.StringAlignment]::Center
    $numSf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString([string]$step.Num, $numFont, $numTextBrush, (New-Object System.Drawing.RectangleF([float]140, [float]($cardY + 55), [float]70, [float]70)), $numSf)
    $numFont.Dispose(); $numTextBrush.Dispose(); $numSf.Dispose()

    # Step title
    $titleFont = Get-Font 30 "Bold"
    $titleBrush = New-Object System.Drawing.SolidBrush($slate900)
    Draw-LeftText $g $step.Title $titleFont $titleBrush 240 ($cardY + 50) 700
    $titleFont.Dispose(); $titleBrush.Dispose()

    # Step description
    $descFont = Get-Font 20 "Regular"
    $descBrush = New-Object System.Drawing.SolidBrush($slate500)
    Draw-LeftText $g $step.Desc $descFont $descBrush 240 ($cardY + 100) 700
    $descFont.Dispose(); $descBrush.Dispose()

    $cardY += 220
}

Draw-SlideNumber $g 4 7 $true

$eyeFont4.Dispose(); $eyeBrush4.Dispose(); $sf4.Dispose()
$head4.Dispose(); $headBr4.Dispose()

Save-Slide $s "slide-04-how-it-works.png"


# ============================================================
# SLIDE 5 — KEY FEATURES
# ============================================================
$s = New-Slide
$g = $s.Graphics

$g.Clear($white)

# Eyebrow
$eyeFont5 = Get-Font 14 "Bold"
$eyeBrush5 = New-Object System.Drawing.SolidBrush($teal)
$sf5 = New-Object System.Drawing.StringFormat
$sf5.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("FEATURES", $eyeFont5, $eyeBrush5, [float]($W/2), [float]120, $sf5)

# Headline
$head5 = Get-Font 42 "Bold"
$headBr5 = New-Object System.Drawing.SolidBrush($slate900)
Draw-CenteredText $g "Everything You Need" $head5 $headBr5 160 800

$features = @(
    @{ Icon = [char]0x2713; Text = "Answer questions instantly" },
    @{ Icon = [char]0x2713; Text = "Take orders and bookings" },
    @{ Icon = [char]0x2713; Text = "Collect payments (MoMo, card, bank)" },
    @{ Icon = [char]0x2713; Text = "Hand off to humans when needed" },
    @{ Icon = [char]0x2713; Text = "Works 24/7, even while you sleep" }
)

$featY = 290
foreach ($feat in $features) {
    # Feature row with tint background
    Draw-RoundedRect $g (New-Object System.Drawing.SolidBrush($purpleTint)) 100 $featY 880 100 14

    # Checkmark circle
    $checkBg = New-Object System.Drawing.SolidBrush($teal)
    $g.FillEllipse($checkBg, 135, ($featY + 25), 50, 50)
    $checkBg.Dispose()

    $checkFont = Get-Font 28 "Bold"
    $checkBrush = New-Object System.Drawing.SolidBrush($white)
    $checkSf = New-Object System.Drawing.StringFormat
    $checkSf.Alignment = [System.Drawing.StringAlignment]::Center
    $checkSf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString([string]$feat.Icon, $checkFont, $checkBrush, (New-Object System.Drawing.RectangleF([float]135, [float]($featY + 25), [float]50, [float]50)), $checkSf)
    $checkFont.Dispose(); $checkBrush.Dispose(); $checkSf.Dispose()

    # Feature text
    $featFont = Get-Font 24 "Regular"
    $featBrush = New-Object System.Drawing.SolidBrush($slate800)
    Draw-LeftText $g $feat.Text $featFont $featBrush 210 ($featY + 32) 700
    $featFont.Dispose(); $featBrush.Dispose()

    $featY += 125
}

Draw-SlideNumber $g 5 7 $true

$eyeFont5.Dispose(); $eyeBrush5.Dispose(); $sf5.Dispose()
$head5.Dispose(); $headBr5.Dispose()

Save-Slide $s "slide-05-features.png"


# ============================================================
# SLIDE 6 — WHY KOVA
# ============================================================
$s = New-Slide
$g = $s.Graphics

# Dark slate background
$g.Clear($slate900)

# Subtle purple glow top-right
$glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, $purple.R, $purple.G, $purple.B))
$g.FillEllipse($glowBrush, 600, -200, 700, 700)
$glowBrush.Dispose()

# Eyebrow
$eyeFont6 = Get-Font 14 "Bold"
$eyeBrush6 = New-Object System.Drawing.SolidBrush($teal)
$sf6 = New-Object System.Drawing.StringFormat
$sf6.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("WHY KOVA", $eyeFont6, $eyeBrush6, [float]($W/2), [float]140, $sf6)

# Headline
$head6 = Get-Font 42 "Bold"
$headBr6 = New-Object System.Drawing.SolidBrush($white)
Draw-CenteredText $g "Built for African Businesses" $head6 $headBr6 185 800

# Feature grid (2x2)
$whyItems = @(
    @{ Title = "No App Needed"; Desc = "Works on the WhatsApp your customers already use" },
    @{ Title = "Launch Fast"; Desc = "Go live in days, not months" },
    @{ Title = "Focus on Fulfillment"; Desc = "Your team handles what matters while AI handles the rest" },
    @{ Title = "Made for You"; Desc = "Salons, shops, restaurants, and service businesses across Africa" }
)

$positions = @(
    @{ X = 80; Y = 320 },
    @{ X = 560; Y = 320 },
    @{ X = 80; Y = 590 },
    @{ X = 560; Y = 590 }
)

for ($i = 0; $i -lt 4; $i++) {
    $item = $whyItems[$i]
    $pos = $positions[$i]

    # Card background
    $cardBg = New-Object System.Drawing.SolidBrush($slate800)
    Draw-RoundedRect $g $cardBg $pos.X $pos.Y 440 230 16
    $cardBg.Dispose()

    # Accent line at top of card
    $accentBrush = if ($i % 2 -eq 0) { New-Object System.Drawing.SolidBrush($purple) } else { New-Object System.Drawing.SolidBrush($teal) }
    $g.FillRectangle($accentBrush, ($pos.X + 24), ($pos.Y + 24), 40, 4)
    $accentBrush.Dispose()

    # Title
    $cardTitle = Get-Font 24 "Bold"
    $cardTitleBr = New-Object System.Drawing.SolidBrush($white)
    Draw-LeftText $g $item.Title $cardTitle $cardTitleBr ($pos.X + 24) ($pos.Y + 50) 392
    $cardTitle.Dispose(); $cardTitleBr.Dispose()

    # Description
    $cardDesc = Get-Font 18 "Regular"
    $cardDescBr = New-Object System.Drawing.SolidBrush($slate400)
    Draw-LeftText $g $item.Desc $cardDesc $cardDescBr ($pos.X + 24) ($pos.Y + 100) 392
    $cardDesc.Dispose(); $cardDescBr.Dispose()
}

Draw-SlideNumber $g 6 7 $false

$eyeFont6.Dispose(); $eyeBrush6.Dispose(); $sf6.Dispose()
$head6.Dispose(); $headBr6.Dispose()

Save-Slide $s "slide-06-why-kova.png"


# ============================================================
# SLIDE 7 — CTA
# ============================================================
$s = New-Slide
$g = $s.Graphics

# Full gradient background
Fill-GradientBg $g

# Overlay pattern — subtle circles
$patternBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 255, 255, 255))
$g.FillEllipse($patternBrush, -150, -150, 500, 500)
$g.FillEllipse($patternBrush, 750, 650, 500, 500)
$g.FillEllipse($patternBrush, 300, 800, 300, 300)
$patternBrush.Dispose()

# Main CTA text
$ctaFont = Get-Font 52 "Bold"
$ctaBrush = New-Object System.Drawing.SolidBrush($white)
Draw-CenteredText $g "Ready to sell on WhatsApp?" $ctaFont $ctaBrush 340 800

# Subtitle
$ctaSub = Get-Font 24 "Regular"
$ctaSubBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 255, 255, 255))
Draw-CenteredText $g "Let Kova handle the conversations while you grow your business." $ctaSub $ctaSubBrush 490 700

# CTA Button
$btnW = 340
$btnH = 64
[float]$btnX = ([float]$W - [float]$btnW) / 2.0
$btnY = 600
Draw-RoundedRect $g (New-Object System.Drawing.SolidBrush($white)) $btnX $btnY $btnW $btnH 32

$btnFont = Get-Font 22 "Bold"
$btnBrush = New-Object System.Drawing.SolidBrush($purple)
$btnSf = New-Object System.Drawing.StringFormat
$btnSf.Alignment = [System.Drawing.StringAlignment]::Center
$btnSf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("Visit getkova.com", $btnFont, $btnBrush, (New-Object System.Drawing.RectangleF([float]$btnX, [float]$btnY, [float]$btnW, [float]$btnH)), $btnSf)
$btnFont.Dispose(); $btnBrush.Dispose(); $btnSf.Dispose()

# Small tagline at bottom
$tagSmall = Get-Font 16 "Regular"
$tagSmallBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 255, 255, 255))
$tagSf = New-Object System.Drawing.StringFormat
$tagSf.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("Kova AI  |  Accra, Ghana", $tagSmall, $tagSmallBr, [float]($W/2), [float]720, $tagSf)
$tagSmall.Dispose(); $tagSmallBr.Dispose(); $tagSf.Dispose()

Draw-SlideNumber $g 7 7 $false

$ctaFont.Dispose(); $ctaBrush.Dispose()
$ctaSub.Dispose(); $ctaSubBrush.Dispose()

Save-Slide $s "slide-07-cta.png"


# Cleanup
$fontCollection.Dispose()

Write-Host ""
Write-Host "========================================="
Write-Host "All 7 slides saved to: $outDir"
Write-Host "========================================="
