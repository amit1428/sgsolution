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

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error occurred.']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 10 * 1024 * 1024; // 10MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File size exceeds maximum limit of 10MB.']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG are supported.']);
    exit;
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'sg_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($extension);
$targetDir = dirname(__DIR__) . '/uploads';

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$targetPath = $targetDir . '/' . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $relativeUrl = './uploads/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $relativeUrl,
        'filename' => $filename,
        'size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file to storage.']);
}
