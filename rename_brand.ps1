$folder = "C:\Users\ismai\OneDrive\Desktop\Project\ismail\Research Data Web"

$htmlFiles = Get-ChildItem "$folder\*.html"
$jsFiles   = Get-ChildItem "$folder\*.js"

function UpdateFile($file) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $orig    = $content

    # -------- Title & meta replacements --------
    $content = $content -replace 'Ledger — Research Data Marketplace', 'Research Hub — Research Data Archive'
    $content = $content -replace 'Ledger Admin',          'Research Hub Admin'
    $content = $content -replace '— Ledger Admin',        '— Research Hub Admin'
    $content = $content -replace '— Ledger\b',            '— Research Hub'
    $content = $content -replace 'Ledger\.',              'Research Hub'
    $content = $content -replace '\bLedger\b',            'Research Hub'

    # -------- aria-labels --------
    $content = $content -replace 'aria-label="Research Hub home"', 'aria-label="Research Hub home"'
    $content = $content -replace 'alt="Research Hub"',             'alt="Research Hub"'

    # -------- Footer copyright --------
    $content = $content -replace '© 2026 Ledger\..*?it\.', '© 2026 Research Hub. Research data, sold directly by the people who collected it.'
    $content = $content -replace '© 2026 Research Hub\..*?it\.', '© 2026 Research Hub. Research data, sold directly by the people who collected it.'

    # -------- Admin sidebar text brand (Ledger<span>.</span>) --------
    $content = $content -replace 'Research Hub<span>\.</span>', 'Research Hub'

    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "UPDATED: $($file.Name)"
    } else {
        Write-Host "no change: $($file.Name)"
    }
}

$htmlFiles | ForEach-Object { UpdateFile $_ }
$jsFiles   | ForEach-Object { UpdateFile $_ }
Write-Host "Done."
