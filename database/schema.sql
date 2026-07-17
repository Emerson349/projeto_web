CREATE DATABASE IF NOT EXISTS compia_editora
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE compia_editora;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  author VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  format ENUM('fisico', 'ebook') NOT NULL DEFAULT 'fisico',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  cover_url VARCHAR(500) NULL,
  isbn VARCHAR(32) NULL,
  publication_year YEAR NULL,
  pages INT UNSIGNED NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY products_slug_unique (slug),
  KEY products_title_index (title),
  KEY products_format_index (format)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_unique (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT product_categories_product_fk
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT product_categories_category_fk
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(110) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY tags_slug_unique (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_tags (
  product_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  CONSTRAINT product_tags_product_fk
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT product_tags_tag_fk
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (name, slug) VALUES
  ('Fundamentos de IA', 'fundamentos-de-ia'),
  ('Aprendizado de Máquina', 'aprendizado-de-maquina'),
  ('Ética e Sociedade', 'etica-e-sociedade'),
  ('Processamento de Linguagem Natural', 'processamento-de-linguagem-natural');

INSERT IGNORE INTO tags (name, slug) VALUES
  ('Acadêmico', 'academico'),
  ('Introdução', 'introducao'),
  ('Pesquisa', 'pesquisa'),
  ('Prática', 'pratica');
