$root = "D:\romeaiapp"
$exclude = @('packages','plugins','scripts','patches','docs','reports','upstreams','characters','git-hooks','graphify-out')

Get-ChildItem -Path $root -Directory -Force | Where-Object { $_.Name -notin $exclude } | ForEach-Object {
    $size = (Get-ChildItem -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Output "$($_.Name): $([math]::Round($size/1MB, 1)) MB"
}

Write-Output ""
Write-Output "--- Key directories ---"
@('packages','plugins') | ForEach-Object {
    $size = (Get-ChildItem -Path "$root\$_" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Output "$_: $([math]::Round($size/1MB, 1)) MB"
}

Write-Output ""
Write-Output "--- node_modules ---"
$nm = Get-ChildItem -Path $root -Directory -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node_modules' }
$totalNM = 0
foreach ($d in $nm) {
    $s = (Get-ChildItem -Path $d.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $totalNM += $s
}
Write-Output "Total node_modules: $([math]::Round($totalNM/1MB, 1)) MB ($($nm.Count) dirs)"

Write-Output ""
Write-Output "--- .git ---"
$gitSize = (Get-ChildItem -Path "$root\.git" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
Write-Output ".git: $([math]::Round($gitSize/1MB, 1)) MB"

Write-Output ""
Write-Output "--- dist / build output ---"
$distDirs = Get-ChildItem -Path $root -Directory -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -in @('dist','.turbo','.next','.nuxt','out','build') }
$totalDist = 0
foreach ($d in $distDirs) {
    $s = (Get-ChildItem -Path $d.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $totalDist += $s
    if ($s -gt 10MB) {
        Write-Output "  $($d.FullName): $([math]::Round($s/1MB, 1)) MB"
    }
}
Write-Output "Total dist/build: $([math]::Round($totalDist/1MB, 1)) MB"

Write-Output ""
Write-Output "--- Large files (>10MB) ---"
Get-ChildItem -Path $root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 10MB } | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
    Write-Output "$($_.FullName): $([math]::Round($_.Length/1MB, 1)) MB"
}
