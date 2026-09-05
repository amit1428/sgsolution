<?php
/**
 * SG Solutions — Unified REST API Engine
 * Handles Public Data Hydration & Authenticated CMS CRUD Operations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth.php';

$action = $_GET['action'] ?? '';

// Helper to parse JSON input for POST/PUT requests
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

try {
    switch ($action) {
        /* ======================================================================
           PUBLIC ENDPOINTS (Frontend Hydration & Form Submissions)
           ====================================================================== */

        // Unified fast initial load endpoint
        case 'get_all':
            $projects = $pdo->query("SELECT * FROM projects ORDER BY sort_order ASC, id DESC")->fetchAll();
            $gallery = $pdo->query("SELECT * FROM gallery ORDER BY sort_order ASC, id DESC")->fetchAll();
            $testimonials = $pdo->query("SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC")->fetchAll();
            $settingsRows = $pdo->query("SELECT key, value FROM settings")->fetchAll();
            
            $settings = [];
            foreach ($settingsRows as $row) {
                $settings[$row['key']] = $row['value'];
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'projects' => $projects,
                    'gallery' => $gallery,
                    'testimonials' => $testimonials,
                    'settings' => $settings
                ]
            ]);
            break;

        case 'get_projects':
            $stmt = $pdo->query("SELECT * FROM projects ORDER BY sort_order ASC, id DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'get_gallery':
            $stmt = $pdo->query("SELECT * FROM gallery ORDER BY sort_order ASC, id DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'get_testimonials':
            $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'submit_consultation':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                break;
            }

            $input = !empty($_POST) ? $_POST : getJsonInput();
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');
            $company = trim($input['company'] ?? '');
            $service = trim($input['service'] ?? 'General Consultation');
            $budget = trim($input['budget'] ?? 'Enterprise Tier');
            $message = trim($input['message'] ?? '');

            if (empty($name) || empty($email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name and Email are required fields.']);
                break;
            }

            $stmt = $pdo->prepare("INSERT INTO consultations (name, email, company, service, budget, message, status) VALUES (?, ?, ?, ?, ?, ?, 'New')");
            $stmt->execute([$name, $email, $company, $service, $budget, $message]);

            echo json_encode([
                'success' => true,
                'message' => 'Consultation inquiry received successfully. Our executive team will respond within 24 hours.',
                'inquiry_id' => $pdo->lastInsertId()
            ]);
            break;

        /* ======================================================================
           AUTHENTICATED CMS CRUD ENDPOINTS
           ====================================================================== */

        // Admin Auth Status
        case 'check_auth':
            echo json_encode([
                'authenticated' => isLoggedIn(),
                'admin' => isLoggedIn() ? [
                    'username' => $_SESSION['sg_admin_username'],
                    'name' => $_SESSION['sg_admin_name']
                ] : null
            ]);
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                break;
            }
            $input = getJsonInput();
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            $result = loginAdmin($username, $password, $pdo);
            echo json_encode($result);
            break;

        case 'logout':
            echo json_encode(logoutAdmin());
            break;

        /* --- PROJECTS CRUD --- */
        case 'create_project':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO projects (title, category, client, year, description, image_url, live_link, tech_stack, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'] ?? 'Untitled Project',
                $data['category'] ?? 'Engineering & Web',
                $data['client'] ?? 'Enterprise Client',
                $data['year'] ?? date('Y'),
                $data['description'] ?? '',
                $data['image_url'] ?? '',
                $data['live_link'] ?? '#',
                $data['tech_stack'] ?? '',
                intval($data['featured'] ?? 0),
                intval($data['sort_order'] ?? 0)
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'update_project':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("UPDATE projects SET title = ?, category = ?, client = ?, year = ?, description = ?, image_url = ?, live_link = ?, tech_stack = ?, featured = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([
                $data['title'],
                $data['category'],
                $data['client'],
                $data['year'],
                $data['description'],
                $data['image_url'],
                $data['live_link'],
                $data['tech_stack'],
                intval($data['featured'] ?? 0),
                intval($data['sort_order'] ?? 0),
                $data['id']
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'delete_project':
            requireAuth();
            $id = $_GET['id'] ?? (getJsonInput()['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        /* --- GALLERY CRUD --- */
        case 'create_gallery':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO gallery (title, category, image_url, caption, sort_order) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'] ?? 'Gallery Item',
                $data['category'] ?? 'General',
                $data['image_url'] ?? '',
                $data['caption'] ?? '',
                intval($data['sort_order'] ?? 0)
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'update_gallery':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("UPDATE gallery SET title = ?, category = ?, image_url = ?, caption = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([
                $data['title'],
                $data['category'],
                $data['image_url'],
                $data['caption'],
                intval($data['sort_order'] ?? 0),
                $data['id']
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'delete_gallery':
            requireAuth();
            $id = $_GET['id'] ?? (getJsonInput()['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        /* --- TESTIMONIALS CRUD --- */
        case 'create_testimonial':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO testimonials (client_name, client_title, company, quote, avatar_url, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['client_name'] ?? 'Client Name',
                $data['client_title'] ?? 'Executive',
                $data['company'] ?? 'Enterprise Co',
                $data['quote'] ?? '',
                $data['avatar_url'] ?? '',
                intval($data['rating'] ?? 5),
                intval($data['sort_order'] ?? 0)
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'update_testimonial':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("UPDATE testimonials SET client_name = ?, client_title = ?, company = ?, quote = ?, avatar_url = ?, rating = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([
                $data['client_name'],
                $data['client_title'],
                $data['company'],
                $data['quote'],
                $data['avatar_url'],
                intval($data['rating'] ?? 5),
                intval($data['sort_order'] ?? 0),
                $data['id']
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'delete_testimonial':
            requireAuth();
            $id = $_GET['id'] ?? (getJsonInput()['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM testimonials WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        /* --- CONSULTATIONS INBOX CRUD --- */
        case 'get_consultations':
            requireAuth();
            $stmt = $pdo->query("SELECT * FROM consultations ORDER BY id DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'update_consultation_status':
            requireAuth();
            $data = getJsonInput();
            $stmt = $pdo->prepare("UPDATE consultations SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $data['id']]);
            echo json_encode(['success' => true]);
            break;

        case 'delete_consultation':
            requireAuth();
            $id = $_GET['id'] ?? (getJsonInput()['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM consultations WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        /* --- SETTINGS & GLOBAL STATS --- */
        case 'get_dashboard_stats':
            requireAuth();
            $projectsCount = $pdo->query("SELECT COUNT(*) as c FROM projects")->fetch()['c'];
            $galleryCount = $pdo->query("SELECT COUNT(*) as c FROM gallery")->fetch()['c'];
            $testimonialsCount = $pdo->query("SELECT COUNT(*) as c FROM testimonials")->fetch()['c'];
            $leadsCount = $pdo->query("SELECT COUNT(*) as c FROM consultations")->fetch()['c'];
            $newLeadsCount = $pdo->query("SELECT COUNT(*) as c FROM consultations WHERE status = 'New'")->fetch()['c'];

            echo json_encode([
                'success' => true,
                'stats' => [
                    'projects' => $projectsCount,
                    'gallery' => $galleryCount,
                    'testimonials' => $testimonialsCount,
                    'leads' => $leadsCount,
                    'new_leads' => $newLeadsCount
                ]
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Unknown API action requested']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
