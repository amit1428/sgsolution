<?php
/**
 * SG Solutions — Admin Logout Handler
 */
require_once dirname(__DIR__) . '/backend/auth.php';
logoutAdmin();
header('Location: login.php');
exit;
