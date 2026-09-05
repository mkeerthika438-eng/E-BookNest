-- Sample book records for E-BookNest
USE ebooknest;

INSERT INTO books (book_id, title, author, isbn, category, description, publisher, publication_year, language, total_copies, available_copies, cover_image, ebook_file) VALUES
('BK001', 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Computer Science', 'A comprehensive guide to modern algorithm design and analysis.', 'MIT Press', 2009, 'English', 4, 4, NULL, NULL),
('BK002', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'A handbook of agile software craftsmanship.', 'Prentice Hall', 2008, 'English', 3, 3, NULL, NULL),
('BK003', 'Database System Concepts', 'Abraham Silberschatz', '9780073523323', 'Database', 'Foundational concepts of database systems and design.', 'McGraw-Hill', 2010, 'English', 3, 3, NULL, NULL),
('BK004', 'Computer Networking: A Top-Down Approach', 'James Kurose', '9780133594140', 'Networking', 'A modern approach to understanding computer networks.', 'Pearson', 2016, 'English', 2, 2, NULL, NULL),
('BK005', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780136042594', 'AI', 'The leading textbook in Artificial Intelligence.', 'Pearson', 2020, 'English', 3, 3, NULL, NULL),
('BK006', 'Pattern Recognition and Machine Learning', 'Christopher Bishop', '9780387310732', 'Machine Learning', 'A comprehensive introduction to pattern recognition and ML.', 'Springer', 2006, 'English', 2, 2, NULL, NULL),
('BK007', 'The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Programming', 'Classic guide to becoming a better software developer.', 'Addison-Wesley', 1999, 'English', 3, 3, NULL, NULL),
('BK008', 'Operating System Concepts', 'Abraham Silberschatz', '9781118063330', 'Computer Science', 'Core concepts of modern operating systems.', 'Wiley', 2012, 'English', 2, 2, NULL, NULL),
('BK009', 'Computer Organization and Design', 'David Patterson', '9780124077263', 'Computer Science', 'The hardware/software interface explained.', 'Morgan Kaufmann', 2013, 'English', 2, 2, NULL, NULL),
('BK010', 'Deep Learning', 'Ian Goodfellow', '9780262035613', 'Machine Learning', 'A comprehensive introduction to deep learning methods.', 'MIT Press', 2016, 'English', 2, 2, NULL, NULL),
('BK011', 'Head First Java', 'Kathy Sierra', '9780596009205', 'Programming', 'A brain-friendly guide to learning Java.', 'O''Reilly', 2005, 'English', 3, 3, NULL, NULL),
('BK012', 'Fundamentals of Data Structures', 'Ellis Horowitz', '9788173716059', 'Computer Science', 'Core data structures explained with examples.', 'Universities Press', 2008, 'English', 4, 4, NULL, NULL),
('BK013', 'Cryptography and Network Security', 'William Stallings', '9780134444284', 'Networking', 'Principles and practice of network security.', 'Pearson', 2017, 'English', 2, 2, NULL, NULL),
('BK014', 'Information Technology for Management', 'Efraim Turban', '9781118890790', 'Information Technology', 'Digital strategy and IT management concepts.', 'Wiley', 2015, 'English', 2, 2, NULL, NULL),
('BK015', 'Software Engineering: A Practitioner''s Approach', 'Roger Pressman', '9780078022128', 'Computer Science', 'A practical approach to software engineering.', 'McGraw-Hill', 2014, 'English', 3, 3, NULL, NULL),
('BK016', 'Dune', 'Frank Herbert', '9780441172719', 'Fiction', 'An epic science fiction saga set on the desert planet Arrakis.', 'Ace Books', 1965, 'English', 2, 2, NULL, NULL),
('BK017', 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 'An exploration of cosmology for general readers.', 'Bantam', 1998, 'English', 2, 2, NULL, NULL),
('BK018', 'The Fabric of the Cosmos', 'Brian Greene', '9780375727207', 'Science', 'Space, time, and the texture of reality.', 'Vintage', 2005, 'English', 2, 2, NULL, NULL),
('BK019', 'Linear Algebra and Its Applications', 'Gilbert Strang', '9780030105678', 'Mathematics', 'A foundational text on linear algebra.', 'Cengage', 2005, 'English', 3, 3, NULL, NULL),
('BK020', 'Discrete Mathematics and Its Applications', 'Kenneth Rosen', '9780073383095', 'Mathematics', 'Comprehensive coverage of discrete math for computing.', 'McGraw-Hill', 2012, 'English', 3, 3, NULL, NULL),
('BK021', 'Foundation', 'Isaac Asimov', '9780553293357', 'Fiction', 'The first novel in Asimov''s classic Foundation series.', 'Spectra', 1951, 'English', 2, 2, NULL, NULL),
('BK022', 'Networking All-in-One For Dummies', 'Doug Lowe', '9781119471614', 'Networking', 'A broad practical overview of networking technologies.', 'Wiley', 2018, 'English', 2, 2, NULL, NULL);
