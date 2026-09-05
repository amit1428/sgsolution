<?php
/**
 * SG Solutions — Admin Authentication & Session Security Handler
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config.php';

function isLoggedIn() {
    return isset($_SESSION['sg_admin_id']) && !empty($_SESSION['sg_admin_id']);
}

function requireAuth() {
    if (!isLoggedIn()) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized: Please log in to access this resource.']);
        exit;
    }
}

function loginAdmin($username, $password, $pdo) {
    $identifier = trim($username);
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? OR email = ?");
    $stmt->execute([$identifier, $identifier]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['sg_admin_id'] = $admin['id'];
        $_SESSION['sg_admin_username'] = $admin['username'];
        $_SESSION['sg_admin_name'] = $admin['name'];
        $_SESSION['sg_admin_email'] = $admin['email'];
        return ['success' => true, 'admin' => ['username' => $admin['username'], 'name' => $admin['name']]];
    }

    return ['success' => false, 'error' => 'Invalid ID / Email or Password'];
}

function logoutAdmin() {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    return ['success' => true];
}
