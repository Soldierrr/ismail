$folder = "C:\Users\ismai\OneDrive\Desktop\Project\ismail\Research Data Web"

# Restore CSS class names that were incorrectly renamed
$allFiles = Get-ChildItem "$folder\*.html","$folder\*.js","$folder\*.css"

foreach ($file in $allFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $orig    = $content

    # Restore class names that were broken (Research Hub-* → ledger-*)
    $content = $content -replace 'Research Hub-card',    'ledger-card'
    $content = $content -replace 'Research Hub-row',     'ledger-row'
    $content = $content -replace 'Research Hub-col',     'ledger-col'
    $content = $content -replace 'Research Hub-table',   'ledger-table'
    $content = $content -replace 'Research Hub-grid',    'ledger-grid'
    $content = $content -replace 'Research Hub-stats',   'ledger-stats'
    $content = $content -replace 'Research Hub-hero',    'ledger-hero'

    # Fix broken aria-label that got garbled
    $content = $content -replace 'aria-label="Research Hub [^"]*"', 'aria-label="Research Hub home"'

    # Fix copyright line (©, .) 
    $content = $content -replace '© 2026 Research Hub Research data', '© 2026 Research Hub. Research data'
    # Also fix missing © symbol cases
    $content = $content -replace 'c 2026 Research Hub Research data', '© 2026 Research Hub. Research data'

    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "FIXED: $($file.Name)"
    } else {
        Write-Host "ok: $($file.Name)"
    }
}
Write-Host "Fixes applied."
