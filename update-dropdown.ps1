# Aktualizacja dropdown menu na wszystkich stronach

$correctDropdownRootLevel = @"
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Extra</a>
                    <ul class="dropdown-menu">
                        <li><a href="projects/audioq.html">AudioQ Plugin</a></li>
                        <li><a href="projects/unreal-engine-rebuilder.html">Unreal Engine Rebuilder</a></li>
                        <li><a href="#" class="disabled-link" data-tooltip="Not yet released - In Development">QSlicer</a></li>
                    </ul>
                </li>
"@

$correctDropdownProjectsLevel = @"
        <li class="dropdown">
          <a href="#" class="dropdown-toggle">Extra</a>
          <ul class="dropdown-menu">
            <li><a href="audioq.html">AudioQ Plugin</a></li>
            <li><a href="unreal-engine-rebuilder.html">Unreal Engine Rebuilder</a></li>
            <li><a href="#" class="disabled-link" data-tooltip="Not yet released - In Development">QSlicer</a></li>
          </ul>
        </li>
"@

# Pliki w głównym katalogu (index, about, contact, music)
$rootFiles = @(
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\index.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\about.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\contact.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\music.html"
)

# Pliki w podkatalogu projects
$projectFiles = @(
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\index.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\akantilado.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\amorak.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\audioq.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\ray-animation.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\richter.html",
    "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\projects\unreal-engine-rebuilder.html"
)

function Update-Dropdown {
    param([string]$filePath, [string]$newDropdown)
    
    if (-not (Test-Path $filePath)) {
        Write-Host "Plik nie istnieje: $filePath" -ForegroundColor Yellow
        return
    }
    
    $content = Get-Content $filePath -Raw
    
    # Regex do znalezienia bloku dropdown
    $pattern = '(?s)<li class="dropdown">.*?<a href="#" class="dropdown-toggle">Extra</a>.*?<ul class="dropdown-menu">.*?</ul>.*?</li>'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $newDropdown.Trim()
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Zaktualizowano: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Nie znaleziono dropdown w: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n=== Aktualizacja plików głównych ===" -ForegroundColor Cyan
foreach ($file in $rootFiles) {
    Update-Dropdown -filePath $file -newDropdown $correctDropdownRootLevel
}

Write-Host "`n=== Aktualizacja plików w podkatalogu projects ===" -ForegroundColor Cyan
foreach ($file in $projectFiles) {
    Update-Dropdown -filePath $file -newDropdown $correctDropdownProjectsLevel
}

Write-Host "`n=== Gotowe! ===" -ForegroundColor Green
