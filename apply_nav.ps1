$dir = "c:\Windows\full-app"
$files = Get-ChildItem -Path $dir -Filter "*.html"

foreach ($file in $files) {
    $content = [IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $orig = $content

    $navVal = "more"
    if ($file.Name -eq "index.html") { $navVal = "home" }
    elseif ($file.Name -in @("scene-menu.html", "scene-menu-v2.html")) { $navVal = "scenes" }
    elseif ($file.Name -eq "training-menu.html" -or $file.Name -match "-training\.html$") { $navVal = "training" }
    elseif ($file.Name -eq "toy-vault.html") { $navVal = "vault" }

    if ($content -notmatch 'href="nav.css"') {
        $content = $content -replace '(?i)(</head>)', "<link rel=`"stylesheet`" href=`"nav.css`" />`n`$1"
    }

    if ($content -match '(?i)<body([^>]*)>') {
        $attrs = $matches[1]
        $attrs = $attrs -replace '(?i)\s*data-nav=(["'']).*?\1', ''
        $newBody = "<body$attrs data-nav=`"$navVal`">"
        $content = $content -replace '(?i)<body[^>]*>', $newBody
    }

    if ($content -notmatch 'src="nav.js"') {
        $content = $content -replace '(?i)(</body>)', "<!-- nav.js injects the nav bar, overlay and More sheet automatically -->`n<script src=`"nav.js`"></script>`n`$1"
    }

    if ($content -cne $orig) {
        [IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($file.Name)"
    } else {
        Write-Host "Skipped $($file.Name)"
    }
}
Write-Host "Done."
