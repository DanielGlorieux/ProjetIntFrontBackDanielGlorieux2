CREATE SCHEMA `library_db` ;

USE library_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    isbn VARCHAR(13) UNIQUE,
    description TEXT,
    publication_year INT,
    quantity_total INT DEFAULT 1,
    quantity_available INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    book_id INT,
    loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP NULL,
    due_date TIMESTAMP NOT NULL,
    status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    book_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);


-- Insérer un utilisateur admin par défaut
-- INSERT INTO users (email, password, first_name, last_name, role) VALUES 
-- ('admin@library.com', '$2a$10$rOvEfP6jxBt6gZLHRzOVReJhfyKjHi7wLp8YMQqgbr3nKXFTCJLYq', 'Admin', 'User', 'admin')
-- ON DUPLICATE KEY UPDATE email = email;

-- Insérer quelques livres d'exemple
-- INSERT INTO books (title, author, genre, isbn, description, publication_year, quantity_total, quantity_available) VALUES 
-- ('Le Petit Prince', 'Antoine de Saint-Exupéry', 'Fiction', '2-07-040857-4', 'Un conte philosophique et poétique', 1943, 5, 5),
-- ('1984', 'George Orwell', 'Science-Fiction', '0-452-28423-4', 'Roman dystopique', 1949, 3, 3),
-- ('Les Misérables', 'Victor Hugo', 'Classique', '2-253-13341-4', 'Roman historique français', 1862, 2, 2)
-- ON DUPLICATE KEY UPDATE title = title;