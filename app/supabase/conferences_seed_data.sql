-- Seed data for conference management
-- Populates rooms, time slots and sample conferences

-- Insert 10 conference rooms
INSERT INTO rooms (name, description) VALUES 
('Salle Alpha', 'Grande salle de conférence équipée pour 200 personnes'),
('Salle Beta', 'Salle polyvalente avec équipements audiovisuels'),
('Salle Gamma', 'Espace intime pour présentations spécialisées'),
('Salle Delta', 'Auditorium principal avec scène'),
('Salle Epsilon', 'Salle de formation avec configuration modulaire'),
('Salle Zeta', 'Espace moderne avec écrans interactifs'),
('Salle Eta', 'Salle climatisée pour événements d''entreprise'),
('Salle Theta', 'Studio avec équipement de diffusion'),
('Salle Iota', 'Salle de réunion exécutive'),
('Salle Kappa', 'Espace collaboration avec mobilier flexible')
ON CONFLICT (name) DO NOTHING;

-- Insert time slots for 3 days (10 slots per day, 9h00-18h45)
-- Day 1
INSERT INTO time_slots (day, start_time, end_time) VALUES 
(1, '09:00', '09:45'),
(1, '10:00', '10:45'),
(1, '11:00', '11:45'),
(1, '12:00', '12:45'),
(1, '13:00', '13:45'),
(1, '14:00', '14:45'),
(1, '15:00', '15:45'),
(1, '16:00', '16:45'),
(1, '17:00', '17:45'),
(1, '18:00', '18:45'),

-- Day 2
(2, '09:00', '09:45'),
(2, '10:00', '10:45'),
(2, '11:00', '11:45'),
(2, '12:00', '12:45'),
(2, '13:00', '13:45'),
(2, '14:00', '14:45'),
(2, '15:00', '15:45'),
(2, '16:00', '16:45'),
(2, '17:00', '17:45'),
(2, '18:00', '18:45'),

-- Day 3
(3, '09:00', '09:45'),
(3, '10:00', '10:45'),
(3, '11:00', '11:45'),
(3, '12:00', '12:45'),
(3, '13:00', '13:45'),
(3, '14:00', '14:45'),
(3, '15:00', '15:45'),
(3, '16:00', '16:45'),
(3, '17:00', '17:45'),
(3, '18:00', '18:45')
ON CONFLICT (day, start_time) DO NOTHING;

-- Insert sample conferences (mix across different rooms and days)
INSERT INTO conferences (title, description, speaker_name, speaker_photo, speaker_bio, room_id, time_slot_id) 
VALUES 
-- Day 1 conferences
('Intelligence Artificielle et Entreprise', 'Comment l''IA transforme les modèles d''affaires traditionnels et crée de nouvelles opportunités.', 'Dr. Marie Dubois', 'https://via.placeholder.com/150', 'Docteure en informatique, experte en IA appliquée aux entreprises.', 1, 1),
('Marketing Digital 2024', 'Les dernières tendances du marketing digital et leur impact sur le ROI.', 'Jean Martin', 'https://via.placeholder.com/150', 'Consultant en marketing digital avec 15 ans d''expérience.', 2, 1),
('Cybersécurité pour PME', 'Guide pratique pour sécuriser votre entreprise contre les menaces numériques.', 'Sophie Laurent', 'https://via.placeholder.com/150', 'Experte en cybersécurité, fondatrice de SecureConsult.', 3, 2),
('Innovation Durable', 'Concilier croissance économique et responsabilité environnementale.', 'Pierre Moreau', 'https://via.placeholder.com/150', 'Directeur innovation chez GreenTech Solutions.', 1, 3),

-- Day 2 conferences
('Leadership Agile', 'Développer un leadership adaptatif dans un monde en constant changement.', 'Amélie Rousseau', 'https://via.placeholder.com/150', 'Coach en leadership, auteure de "Manager Autrement".', 4, 11),
('Blockchain Business', 'Applications pratiques de la blockchain au-delà des cryptomonnaies.', 'Thomas Leroux', 'https://via.placeholder.com/150', 'CTO blockchain, expert en technologies distribuées.', 5, 12),
('E-commerce Performant', 'Optimiser votre boutique en ligne pour maximiser les conversions.', 'Claire Petit', 'https://via.placeholder.com/150', 'Consultante e-commerce, ex-Amazon.', 2, 13),

-- Day 3 conferences
('Data Science Appliquée', 'Transformer vos données en avantage concurrentiel.', 'Marc Durand', 'https://via.placeholder.com/150', 'Data Scientist senior, spécialiste BI.', 6, 21),
('Ressources Humaines 3.0', 'L''évolution du management des talents à l''ère digitale.', 'Isabelle Vincent', 'https://via.placeholder.com/150', 'DRH innovation, experte en transformation RH.', 7, 22),
('Fintech et Banking', 'Comment la fintech révolutionne les services bancaires.', 'François Blanc', 'https://via.placeholder.com/150', 'Ex-directeur innovation banque, fondateur de FinStart.', 8, 23);

-- Note: More conferences can be added by organizers through the admin interface 