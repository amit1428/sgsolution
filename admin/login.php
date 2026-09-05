<?php
/**
 * SG Solutions — Executive CMS Login
 */
session_start();
require_once dirname(__DIR__) . '/backend/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $result = loginAdmin($username, $password, $pdo);
    if ($result['success']) {
        header('Location: index.php');
        exit;
    } else {
        $error = $result['error'];
    }
}

if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Admin Sign In | SG Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">
  <link rel="stylesheet" href="./admin.css">
</head>
<body class="login-body">
  <div class="login-glow orb-1"></div>
  <div class="login-glow orb-2"></div>

  <div class="login-container">
    <div class="login-card card-3d">
      <div class="login-header">
        <a href="../index.html" class="login-brand">
          <img src="../logo.png" alt="SG Solutions" class="login-logo">
        </a>
        <span class="login-badge">
          <span class="badge-dot"></span>
          CMS CONTROL CENTER
        </span>
        <h1 class="login-title">Executive Sign In</h1>
        <p class="login-subtitle">Authenticate with your master ID and password to access the CMS management dashboard.</p>
      </div>

      <?php if (!empty($error)): ?>
        <div class="login-error-alert">
          <span class="material-symbols-outlined text-sm">error</span>
          <span><?= htmlspecialchars($error) ?></span>
        </div>
      <?php endif; ?>

      <form method="POST" action="login.php" class="login-form">
        <div class="form-group">
          <label class="form-label" for="username">Administrator ID / Email</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">mail</span>
            <input type="text" id="username" name="username" class="form-input" placeholder="support@sgsolutions.co.in" required autofocus value="support@sgsolutions.co.in">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">lock</span>
            <input type="password" id="password" name="password" class="form-input" placeholder="Enter password" required value="SGSolution@2026@">
          </div>
        </div>

        <div class="login-hint">
          <span class="material-symbols-outlined text-xs text-gold">verified_user</span>
          <span>Authorized Access: <strong>support@sgsolutions.co.in</strong></span>
        </div>

        <button type="submit" class="cta-gold-btn full-w">
          <span>Sign In to Executive CMS</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </form>

      <div class="login-footer">
        <a href="../index.html" class="back-link">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          <span>Return to Public Website</span>
        </a>
      </div>
    </div>
  </div>
</body>
</html>
