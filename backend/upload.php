<?php
/**
 * SG Solutions — Secure Image & Media Upload Handler
 */

header('Content-Type: application/json');

require_once __DIR__ . '/auth.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Support both 'file' and 'image' or any first file input
$file = null;
if (!empty($_FILES)) {
    if (isset($_FILES['file']) && is_array($_FILES['file'])) {
        $file = $_FILES['file'];
    } elseif (isset($_FILES['image']) && is_array($_FILES['image'])) {
        $file = $_FILES['image'];
    } else {
        $firstKey = array_key_first($_FILES);
        if ($firstKey && isset($_FILES[$firstKey])) {
            $file = $_FILES[$firstKey];
        }
    }
}

if (!$file || !isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
    $errCode = $file['error'] ?? 'MISSING';
    $errMsg = 'No image selected or upload error occurred.';
    switch ($errCode) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $errMsg = 'File exceeds maximum upload size limit allowed by server.';
            break;
        case UPLOAD_ERR_PARTIAL:
            $errMsg = 'File was only partially uploaded. Please try again.';
            break;
        case UPLOAD_ERR_NO_FILE:
            $errMsg = 'No file was received. Please select an image from your device.';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $errMsg = 'Missing temporary folder on server.';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $errMsg = 'Failed to write file to disk.';
            break;
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $errMsg]);
    exit;
}

$maxSize = 15 * 1024 * 1024; // 15MB
$allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
];

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File size exceeds maximum limit of 15MB.']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file format (' . htmlspecialchars($mimeType) . '). Please upload a JPG, PNG, WEBP, GIF, SVG, or AVIF image.']);
    exit;
}

// Determine safe extension
$extMap = [
    'image/jpeg' => 'jpg',
    'image/jpg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
    'image/avif' => 'avif'
];
$originalExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$extension = $originalExt ?: ($extMap[$mimeType] ?? 'jpg');

$filename = 'sg_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
$targetDir = dirname(__DIR__) . '/uploads';

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$targetPath = $targetDir . '/' . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $relativeUrl = 'uploads/' . $filename;
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'url' => $relativeUrl,
        'image_url' => $relativeUrl,
        'admin_preview_url' => '../uploads/' . $filename,
        'filename' => $filename,
        'size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file to storage.']);
}
