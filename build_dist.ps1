# Build Production Dist Package & ZIP for Hostinger
$sourceDir = "d:\reacta\NewSG"
$distDir = "$sourceDir\dist"
$zipFile = "$sourceDir\dist.zip"

Write-Host "Cleaning previous dist directory..."
if (Test-Path $distDir) {
    Remove-Item -Recurse -Force $distDir
}
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

Write-Host "Copying core frontend assets..."
Copy-Item "$sourceDir\index.html" "$distDir\" -Force
Copy-Item "$sourceDir\style.css" "$distDir\" -Force
Copy-Item "$sourceDir\main.js" "$distDir\" -Force
Copy-Item "$sourceDir\.htaccess" "$distDir\" -Force

if (Test-Path "$sourceDir\logo.png") { Copy-Item "$sourceDir\logo.png" "$distDir\" -Force }
if (Test-Path "$sourceDir\logo.jpg") { Copy-Item "$sourceDir\logo.jpg" "$distDir\" -Force }
if (Test-Path "$sourceDir\logo.svg") { Copy-Item "$sourceDir\logo.svg" "$distDir\" -Force }
if (Test-Path "$sourceDir\sg-hero.jpg") { Copy-Item "$sourceDir\sg-hero.jpg" "$distDir\" -Force }
if (Test-Path "$sourceDir\Woman_typing_on_laptop_1080p_202609011623.mp4") {
    Copy-Item "$sourceDir\Woman_typing_on_laptop_1080p_202609011623.mp4" "$distDir\" -Force
}

Write-Host "Copying admin panel..."
$adminDist = "$distDir\admin"
New-Item -ItemType Directory -Path $adminDist -Force | Out-Null
Copy-Item "$sourceDir\admin\*" $adminDist -Recurse -Force

Write-Host "Copying backend engine..."
$backendDist = "$distDir\backend"
New-Item -ItemType Directory -Path $backendDist -Force | Out-Null
Copy-Item "$sourceDir\backend\*" $backendDist -Recurse -Force

Write-Host "Copying uploads..."
$uploadsDist = "$distDir\uploads"
New-Item -ItemType Directory -Path $uploadsDist -Force | Out-Null
if (Test-Path "$sourceDir\uploads") {
    Copy-Item "$sourceDir\uploads\*" $uploadsDist -Recurse -Force
}

# Create a clear Hostinger README inside dist
$readmeContent = @"
========================================================================
SG SOLUTIONS — HOSTINGER DEPLOYMENT INSTRUCTIONS
========================================================================

1. UPLOAD:
   Extract all contents of this package into the `public_html` directory
   of your domain inside Hostinger File Manager.

2. DATABASE SETUP (Choose Option A or Option B):

   --- OPTION A: MySQL with phpMyAdmin (Recommended for Hostinger) ---
   a. In Hostinger hPanel, go to Databases -> MySQL Databases -> Create Database:
      - Database Name (e.g. u123456789_sgsolutions)
      - Database User (e.g. u123456789_admin)
      - Password
   b. Click "Enter phpMyAdmin" next to your new database.
   c. Click the "Import" tab at the top.
   d. Select the file: `backend/database/sg_solutions_mysql.sql` and click "Go".
   e. Open `backend/config.php` in Hostinger File Manager and enter your DB credentials:
      define('DB_DRIVER', 'mysql');
      define('DB_HOST', 'localhost');
      define('DB_NAME', 'YOUR_HOSTINGER_DB_NAME');
      define('DB_USER', 'YOUR_HOSTINGER_DB_USER');
      define('DB_PASS', 'YOUR_HOSTINGER_DB_PASSWORD');

   --- OPTION B: Standalone SQLite (Zero Setup) ---
   - Leave `backend/config.php` as default!
   - SQLite is already pre-configured and will work immediately with no database creation needed.

3. ACCESS:
   - Public Website: https://yourdomain.com/
   - Executive Admin CMS: https://yourdomain.com/admin
   - Master Admin ID: support@sgsolutions.co.in
   - Master Password: SGSolution@2026@
========================================================================
"@
Set-Content -Path "$distDir\HOSTINGER_README.txt" -Value $readmeContent

Write-Host "Creating dist.zip archive..."
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile -Force

$zipInfo = Get-Item $zipFile
Write-Host "SUCCESS: dist.zip created successfully ($([math]::Round($zipInfo.Length / 1MB, 2)) MB)"
