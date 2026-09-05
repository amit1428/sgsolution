-- =========================================================================
-- SG Solutions — Enterprise Database Export (MySQL / MariaDB for phpMyAdmin)
-- Generated for Hostinger / cPanel / hPanel Deployment
-- Database: sg_solutions (or your custom Hostinger DB name)
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- -------------------------------------------------------------------------
-- Table: admins (Executive CMS Administrator Accounts)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_admin_username` (`username`),
  KEY `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Admin Account (support@sgsolutions.co.in / SGSolution@2026@)
INSERT INTO `admins` (`id`, `username`, `password_hash`, `name`, `email`, `created_at`) VALUES
(1, 'support@sgsolutions.co.in', '$2y$10$iM.sV1vO/WvAoxr1Y6x3sOf3b4y9oD/nZp6vUf8iZ2Zl9xS6W7T4e', 'SG Solutions Support', 'support@sgsolutions.co.in', NOW())
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `name` = VALUES(`name`);

-- -------------------------------------------------------------------------
-- Table: projects (Enterprise Portfolio Case Studies)
-- -------------------------------------------------------------------------
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

INSERT INTO `projects` (`id`, `title`, `category`, `client`, `year`, `description`, `image_url`, `live_link`, `tech_stack`, `featured`, `sort_order`, `created_at`) VALUES
(1, 'Nexus Global Wealth Gateway', 'Websites', 'Aether Financial AG', '2025', 'Architected a sub-millisecond multi-currency wealth management platform with real-time biometric fraud telemetry and institutional trading dashboards.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop', '#', 'Next.js, TypeScript, WebGL, Rust Microservices', 1, 1, NOW()),
(2, 'Lumina Health Biometric OS', 'Mobile Apps', 'Lumina Care Labs', '2025', 'Engineered a 120Hz native mobile health monitoring system delivering real-time vitals synchronization across iOS and Android with zero latency.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop', '#', 'React Native, Swift, Kotlin, Edge AI', 1, 2, NOW()),
(3, 'Vortex Automated CRM Pipeline', 'Softwares', 'Starlight Logistics Corp', '2024', 'Unified 14 disparate enterprise customer data systems into a single automated ETL pipeline processing 50M+ daily events with 99.999% reliability.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop', '#', 'Salesforce API, Python ETL, PostgreSQL, Docker', 1, 3, NOW()),
(4, 'OmniScale Algorithmic Ad Engine', 'Digital Marketing', 'Hyperion Brands LLC', '2024', 'Deployed an AI-powered multi-touch attribution engine that optimized $12M+ annual media spend, scaling customer acquisition ROAS by 340%.', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop', '#', 'Attribution AI, Google Ads API, BigQuery, Meta Graph', 1, 4, NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `category`=VALUES(`category`);

-- -------------------------------------------------------------------------
-- Table: gallery (Design & Engineering Media Gallery)
-- -------------------------------------------------------------------------
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

INSERT INTO `gallery` (`id`, `title`, `category`, `image_url`, `caption`, `sort_order`, `created_at`) VALUES
(1, 'Executive Innovation Hub', 'Corporate Hubs', 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop', 'SG Solutions Global Architecture Center & Executive Strategy Suite.', 1, NOW()),
(2, 'High-Performance Engineering Lab', 'Engineering', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop', 'Senior engineering squads running distributed cloud scalability simulations.', 2, NOW()),
(3, 'Sub-Millisecond UI Design System', 'Design & UI', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop', 'Crafting frictionless micro-interactions and tactile luxury digital design tokens.', 3, NOW()),
(4, 'Enterprise Cloud Telemetry Center', 'Infrastructure', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', '24/7 Site Reliability & Zero-Trust Security operations monitoring.', 4, NOW()),
(5, 'Algorithmic Marketing Command', 'Growth & AI', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop', 'Real-time multi-channel campaign attribution and predictive conversion funnels.', 5, NOW()),
(6, 'Global Team Strategic Briefing', 'Corporate Hubs', 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=1200&auto=format&fit=crop', 'Synchronized collaboration between London, Singapore, and New York pods.', 6, NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- -------------------------------------------------------------------------
-- Table: testimonials (Client Endorsements)
-- -------------------------------------------------------------------------
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

INSERT INTO `testimonials` (`id`, `client_name`, `client_title`, `company`, `quote`, `avatar_url`, `rating`, `sort_order`, `created_at`) VALUES
(1, 'Dr. Aris Thorne', 'Chief Information Officer', 'Aether Financial AG (Zurich)', 'SG Solutions completely transformed our global financial portal. Their engineering squad delivered sub-millisecond execution with zero downtime over 24 months of continuous operations.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop', 5, 1, NOW()),
(2, 'Elena Rostova', 'VP of Digital Experience', 'Lumina Care Labs (Boston)', 'The mobile architecture built by SG Solutions sets a new benchmark in our sector. Fluid 120Hz micro-interactions, robust biometric encryption, and extraordinary design craftsmanship.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', 5, 2, NOW()),
(3, 'Marcus Vance', 'Managing Director & CMO', 'Hyperion Global Enterprises (London)', 'Partnering with SG Solutions on algorithmic growth and full-funnel digital marketing yielded a 340% increase in qualified enterprise deal velocity within the first three quarters.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', 5, 3, NOW())
ON DUPLICATE KEY UPDATE `client_name`=VALUES(`client_name`);

-- -------------------------------------------------------------------------
-- Table: consultations (Leads & Inquiries Inbox)
-- -------------------------------------------------------------------------
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

-- -------------------------------------------------------------------------
-- Table: settings (Configuration Key-Value Store)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Table: system_config (System Initialization & Seed Control)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_config` (
  `config_key` VARCHAR(100) NOT NULL,
  `config_value` TEXT NOT NULL,
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_config` (`config_key`, `config_value`) VALUES
('db_seeded', '1')
ON DUPLICATE KEY UPDATE `config_value` = '1';

SET FOREIGN_KEY_CHECKS = 1;
