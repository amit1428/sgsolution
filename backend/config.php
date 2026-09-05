<?php
/**
 * SG Solutions — Backend Database Configuration & Auto-Migrator
 * Supports both Hostinger MySQL (via phpMyAdmin) and standalone SQLite
 */

// Enable error reporting during development
error_reporting(E_ALL);
ini_set('display_errors', 0);

// =========================================================================
// DATABASE CONFIGURATION SETTINGS
// =========================================================================
// Set DB_DRIVER to 'mysql' when using Hostinger phpMyAdmin MySQL, or 'sqlite' for standalone file.
// If you leave DB_DRIVER as 'auto', it connects to MySQL if credentials are provided, or SQLite otherwise.
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'auto'); 

// BigRock MySQL Credentials
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'newla368_sgdb');
define('DB_USER', getenv('DB_USER') ?: 'newla368_admin');
define('DB_PASS', getenv('DB_PASS') ?: 'SGsolution@2026');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

// Directories setup
$dbDir = __DIR__ . '/database';
if (!file_exists($dbDir)) {
    mkdir($dbDir, 0755, true);
}

$uploadsDir = dirname(__DIR__) . '/uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$dbPath = $dbDir . '/sg_solutions.sqlite';

// Determine connection type
$useMySQL = false;
if (DB_DRIVER === 'mysql') {
    $useMySQL = true;
} elseif (DB_DRIVER === 'auto' && !empty(DB_NAME) && !empty(DB_USER)) {
    $useMySQL = true;
}

try {
    if ($useMySQL) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $dbEngine = 'mysql';
    } else {
        $pdo = new PDO("sqlite:" . $dbPath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec("PRAGMA foreign_keys = ON;");
        $dbEngine = 'sqlite';
    }
} catch (PDOException $e) {
    // If MySQL connection fails, attempt fallback to SQLite
    if ($useMySQL && file_exists($dbPath)) {
        try {
            $pdo = new PDO("sqlite:" . $dbPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec("PRAGMA foreign_keys = ON;");
            $dbEngine = 'sqlite';
        } catch (PDOException $ex) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    } else {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
}

/**
 * Initialize Tables and Default Seed Data
 */
function initDatabase($pdo, $dbEngine = 'sqlite') {
    if ($dbEngine === 'mysql') {
        // MySQL Tables
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `admins` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `username` VARCHAR(191) NOT NULL,
                `password_hash` VARCHAR(255) NOT NULL,
                `name` VARCHAR(191) NOT NULL,
                `email` VARCHAR(191) DEFAULT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `idx_admin_username` (`username`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `projects` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `title` VARCHAR(255) NOT NULL,
                `category` VARCHAR(100) NOT NULL,
                `client` VARCHAR(191) NOT NULL,
                `year` VARCHAR(20) NOT NULL,
                `description` TEXT NOT NULL,
                `image_url` VARCHAR(500) NOT NULL,
                `live_link` VARCHAR(500) DEFAULT '#',
                `tech_stack` VARCHAR(255) NOT NULL,
                `featured` TINYINT(1) DEFAULT 0,
                `sort_order` INT(11) DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `gallery` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `title` VARCHAR(255) NOT NULL,
                `category` VARCHAR(100) NOT NULL,
                `image_url` VARCHAR(500) NOT NULL,
                `caption` TEXT DEFAULT NULL,
                `sort_order` INT(11) DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `testimonials` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `client_name` VARCHAR(191) NOT NULL,
                `client_title` VARCHAR(191) NOT NULL,
                `company` VARCHAR(191) NOT NULL,
                `quote` TEXT NOT NULL,
                `avatar_url` VARCHAR(500) NOT NULL,
                `rating` INT(11) DEFAULT 5,
                `sort_order` INT(11) DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `consultations` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(191) NOT NULL,
                `email` VARCHAR(191) NOT NULL,
                `company` VARCHAR(191) DEFAULT NULL,
                `service` VARCHAR(100) NOT NULL,
                `budget` VARCHAR(100) DEFAULT NULL,
                `message` TEXT NOT NULL,
                `status` VARCHAR(50) DEFAULT 'New',
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        // SQLite Tables
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                client TEXT NOT NULL,
                year TEXT NOT NULL,
                description TEXT NOT NULL,
                image_url TEXT NOT NULL,
                live_link TEXT,
                tech_stack TEXT NOT NULL,
                featured INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT NOT NULL,
                caption TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                client_title TEXT NOT NULL,
                company TEXT NOT NULL,
                quote TEXT NOT NULL,
                avatar_url TEXT NOT NULL,
                rating INTEGER DEFAULT 5,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                company TEXT,
                service TEXT NOT NULL,
                budget TEXT,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'New',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }

    // Seed or update master admin (support@sgsolutions.co.in / SGSolution@2026@)
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE email = ? OR username = ?");
    $stmt->execute(['support@sgsolutions.co.in', 'support@sgsolutions.co.in']);
    $existing = $stmt->fetch();
    $masterPassHash = password_hash('SGSolution@2026@', PASSWORD_BCRYPT);

    if ($existing) {
        $update = $pdo->prepare("UPDATE admins SET password_hash = ?, username = ?, name = ? WHERE id = ?");
        $update->execute([$masterPassHash, 'support@sgsolutions.co.in', 'SG Solutions Support', $existing['id']]);
    } else {
        $insertAdmin = $pdo->prepare("INSERT INTO admins (username, password_hash, name, email) VALUES (?, ?, ?, ?)");
        $insertAdmin->execute(['support@sgsolutions.co.in', $masterPassHash, 'SG Solutions Support', 'support@sgsolutions.co.in']);
    }

    // Seed initial Projects if empty
    $pStmt = $pdo->query("SELECT COUNT(*) as count FROM projects");
    $pRes = $pStmt->fetch();
    if ($pRes['count'] == 0) {
        $initialProjects = [
            [
                'title' => 'Nexus Global Wealth Gateway',
                'category' => 'FinTech & Web',
                'client' => 'Aether Financial AG',
                'year' => '2025',
                'description' => 'Architected a sub-millisecond multi-currency wealth management platform with real-time biometric fraud telemetry and institutional trading dashboards.',
                'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
                'live_link' => '#',
                'tech_stack' => 'Next.js, TypeScript, WebGL, Rust Microservices',
                'featured' => 1,
                'sort_order' => 1
            ],
            [
                'title' => 'Lumina Health Biometric OS',
                'category' => 'Mobile & Health',
                'client' => 'Lumina Care Labs',
                'year' => '2025',
                'description' => 'Engineered a 120Hz native mobile health monitoring system delivering real-time vitals synchronization across iOS and Android with zero latency.',
                'image_url' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
                'live_link' => '#',
                'tech_stack' => 'React Native, Swift, Kotlin, Edge AI',
                'featured' => 1,
                'sort_order' => 2
            ],
            [
                'title' => 'Vortex Automated CRM Pipeline',
                'category' => 'Enterprise CRM',
                'client' => 'Starlight Logistics Corp',
                'year' => '2024',
                'description' => 'Unified 14 disparate enterprise customer data systems into a single automated ETL pipeline processing 50M+ daily events with 99.999% reliability.',
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
                'live_link' => '#',
                'tech_stack' => 'Salesforce API, Python ETL, PostgreSQL, Docker',
                'featured' => 1,
                'sort_order' => 3
            ],
            [
                'title' => 'OmniScale Algorithmic Ad Engine',
                'category' => 'Digital Marketing',
                'client' => 'Hyperion Brands LLC',
                'year' => '2024',
                'description' => 'Deployed an AI-powered multi-touch attribution engine that optimized $12M+ annual media spend, scaling customer acquisition ROAS by 340%.',
                'image_url' => 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop',
                'live_link' => '#',
                'tech_stack' => 'Attribution AI, Google Ads API, BigQuery, Meta Graph',
                'featured' => 1,
                'sort_order' => 4
            ]
        ];

        $insProj = $pdo->prepare("INSERT INTO projects (title, category, client, year, description, image_url, live_link, tech_stack, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($initialProjects as $p) {
            $insProj->execute([$p['title'], $p['category'], $p['client'], $p['year'], $p['description'], $p['image_url'], $p['live_link'], $p['tech_stack'], $p['featured'], $p['sort_order']]);
        }
    }

    // Seed initial Gallery if empty
    $gStmt = $pdo->query("SELECT COUNT(*) as count FROM gallery");
    $gRes = $gStmt->fetch();
    if ($gRes['count'] == 0) {
        $initialGallery = [
            [
                'title' => 'Executive Innovation Hub',
                'category' => 'Corporate Hubs',
                'image_url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
                'caption' => 'SG Solutions Global Architecture Center & Executive Strategy Suite.',
                'sort_order' => 1
            ],
            [
                'title' => 'High-Performance Engineering Lab',
                'category' => 'Engineering',
                'image_url' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
                'caption' => 'Senior engineering squads running distributed cloud scalability simulations.',
                'sort_order' => 2
            ],
            [
                'title' => 'Sub-Millisecond UI Design System',
                'category' => 'Design & UI',
                'image_url' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
                'caption' => 'Crafting frictionless micro-interactions and tactile luxury digital design tokens.',
                'sort_order' => 3
            ],
            [
                'title' => 'Enterprise Cloud Telemetry Center',
                'category' => 'Infrastructure',
                'image_url' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
                'caption' => '24/7 Site Reliability & Zero-Trust Security operations monitoring.',
                'sort_order' => 4
            ],
            [
                'title' => 'Algorithmic Marketing Command',
                'category' => 'Growth & AI',
                'image_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
                'caption' => 'Real-time multi-channel campaign attribution and predictive conversion funnels.',
                'sort_order' => 5
            ],
            [
                'title' => 'Global Team Strategic Briefing',
                'category' => 'Corporate Hubs',
                'image_url' => 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=1200&auto=format&fit=crop',
                'caption' => 'Synchronized collaboration between London, Singapore, and New York pods.',
                'sort_order' => 6
            ]
        ];

        $insGal = $pdo->prepare("INSERT INTO gallery (title, category, image_url, caption, sort_order) VALUES (?, ?, ?, ?, ?)");
        foreach ($initialGallery as $g) {
            $insGal->execute([$g['title'], $g['category'], $g['image_url'], $g['caption'], $g['sort_order']]);
        }
    }

    // Seed initial Testimonials if empty
    $tStmt = $pdo->query("SELECT COUNT(*) as count FROM testimonials");
    $tRes = $tStmt->fetch();
    if ($tRes['count'] == 0) {
        $initialTestimonials = [
            [
                'client_name' => 'Dr. Aris Thorne',
                'client_title' => 'Chief Information Officer',
                'company' => 'Aether Financial AG (Zurich)',
                'quote' => 'SG Solutions completely transformed our global financial portal. Their engineering squad delivered sub-millisecond execution with zero downtime over 24 months of continuous operations.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
                'rating' => 5,
                'sort_order' => 1
            ],
            [
                'client_name' => 'Elena Rostova',
                'client_title' => 'VP of Digital Experience',
                'company' => 'Lumina Care Labs (Boston)',
                'quote' => 'The mobile architecture built by SG Solutions sets a new benchmark in our sector. Fluid 120Hz micro-interactions, robust biometric encryption, and extraordinary design craftsmanship.',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
                'rating' => 5,
                'sort_order' => 2
            ],
            [
                'client_name' => 'Marcus Vance',
                'client_title' => 'Managing Director & CMO',
                'company' => 'Hyperion Global Enterprises (London)',
                'quote' => 'Partnering with SG Solutions on algorithmic growth and full-funnel digital marketing yielded a 340% increase in qualified enterprise deal velocity within the first three quarters.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
                'rating' => 5,
                'sort_order' => 3
            ]
        ];

        $insTest = $pdo->prepare("INSERT INTO testimonials (client_name, client_title, company, quote, avatar_url, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($initialTestimonials as $t) {
            $insTest->execute([$t['client_name'], $t['client_title'], $t['company'], $t['quote'], $t['avatar_url'], $t['rating'], $t['sort_order']]);
        }
    }
}

// Auto-run schema migrations
initDatabase($pdo, $dbEngine);
