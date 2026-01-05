-- CREATE DATABASE 
Create database TEST;
USE TEST;

CREATE TABLE `Role` (
    `role_ID` VARCHAR(50) NOT NULL,
    `role_name` VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (`role_ID`)
);

CREATE TABLE `SubscriptionPlan` (
    `plan_ID` VARCHAR(50) NOT NULL,
    `plan_name` VARCHAR(50) NOT NULL UNIQUE,
    `price` INT NOT NULL,
    `resolution` VARCHAR(20),
    `screen_count` INT,
    PRIMARY KEY (`plan_ID`)
);

CREATE TABLE `User` (
    `user_ID` VARCHAR(50) NOT NULL,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `plan_ID` VARCHAR(50) NULL, 
    `role_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`user_ID`),
    
    CONSTRAINT `fk_user_role` FOREIGN KEY (`role_ID`) 
        REFERENCES `Role`(`role_ID`) ON UPDATE CASCADE ON DELETE RESTRICT,
        
    CONSTRAINT `fk_user_plan` FOREIGN KEY (`plan_ID`) 
        REFERENCES `SubscriptionPlan`(`plan_ID`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE `Nationality` (
    `nationality_ID` VARCHAR(50) NOT NULL, 
    `nationality_name` VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (`nationality_ID`)
);

CREATE TABLE `Actor` (
    `actor_ID` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `birth_date` DATE,
    `nationality_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`actor_ID`),
    CONSTRAINT `fk_actor_nation` FOREIGN KEY (`nationality_ID`) 
        REFERENCES `Nationality`(`nationality_ID`) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE `Director` (
    `director_ID` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `nationality_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`director_ID`),
    CONSTRAINT `fk_director_nation` FOREIGN KEY (`nationality_ID`) 
        REFERENCES `Nationality`(`nationality_ID`) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE `Genre` (
    `genre_ID` VARCHAR(50) NOT NULL,
    `genre_name` VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (`genre_ID`)
);

CREATE TABLE `Media` (
    `media_ID` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `release_date` DATE,
    `description` TEXT,
    
    PRIMARY KEY (`media_ID`),
    CONSTRAINT `chk_media_type` CHECK (`type` IN ('Movie', 'Series'))
);

CREATE TABLE `Movie` (
    `media_ID` VARCHAR(50) NOT NULL,
    `duration` INT,
    `box_office` DECIMAL(15,2),
    
    PRIMARY KEY (`media_ID`),
    CONSTRAINT `fk_movie_media` FOREIGN KEY (`media_ID`) 
        REFERENCES `Media`(`media_ID`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `Series` (
    `media_ID` VARCHAR(50) NOT NULL,
    `total_seasons` INT,
    
    PRIMARY KEY (`media_ID`),
    CONSTRAINT `fk_series_media` FOREIGN KEY (`media_ID`) 
        REFERENCES `Media`(`media_ID`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `Episode` (
    `episode_ID` VARCHAR(50) NOT NULL,
    `media_ID` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255),
    `season_num` INT,
    `duration` INT,
    `release_date` DATE,
    
    PRIMARY KEY (`episode_ID`),
    CONSTRAINT `fk_episode_series` FOREIGN KEY (`media_ID`) 
        REFERENCES `Series`(`media_ID`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `Media_Actor` (
    `media_ID` VARCHAR(50) NOT NULL,
    `actor_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`media_ID`, `actor_ID`),
    CONSTRAINT `fk_ma_media` FOREIGN KEY (`media_ID`) REFERENCES `Media`(`media_ID`) ON DELETE CASCADE,
    CONSTRAINT `fk_ma_actor` FOREIGN KEY (`actor_ID`) REFERENCES `Actor`(`actor_ID`) ON DELETE CASCADE
);

CREATE TABLE `Media_Director` (
    `media_ID` VARCHAR(50) NOT NULL,
    `director_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`media_ID`, `director_ID`),
    CONSTRAINT `fk_md_media` FOREIGN KEY (`media_ID`) REFERENCES `Media`(`media_ID`) ON DELETE CASCADE,
    CONSTRAINT `fk_md_director` FOREIGN KEY (`director_ID`) REFERENCES `Director`(`director_ID`) ON DELETE CASCADE
);

CREATE TABLE `Media_Genre` (
    `media_ID` VARCHAR(50) NOT NULL,
    `genre_ID` VARCHAR(50) NOT NULL,
    
    PRIMARY KEY (`media_ID`, `genre_ID`),
    CONSTRAINT `fk_mg_media` FOREIGN KEY (`media_ID`) REFERENCES `Media`(`media_ID`) ON DELETE CASCADE,
    CONSTRAINT `fk_mg_genre` FOREIGN KEY (`genre_ID`) REFERENCES `Genre`(`genre_ID`) ON DELETE CASCADE
);

CREATE TABLE `Rating` (
    `user_ID` VARCHAR(50) NOT NULL,
    `media_ID` VARCHAR(50) NOT NULL,
    `score` INT NOT NULL,
    `comment` TEXT,
    
    PRIMARY KEY (`user_ID`, `media_ID`),
    CONSTRAINT `chk_rating_score` CHECK (`score` BETWEEN 1 AND 10),
    CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_ID`) REFERENCES `User`(`user_ID`) ON DELETE CASCADE,
    CONSTRAINT `fk_rating_media` FOREIGN KEY (`media_ID`) REFERENCES `Media`(`media_ID`) ON DELETE CASCADE
);

CREATE TABLE `WatchList` (
    `user_ID` VARCHAR(50) NOT NULL,
    `media_ID` VARCHAR(50) NOT NULL,
    `date_added` DATE DEFAULT (CURRENT_DATE),
    
    PRIMARY KEY (`user_ID`, `media_ID`),
    CONSTRAINT `fk_wl_user` FOREIGN KEY (`user_ID`) REFERENCES `User`(`user_ID`) ON DELETE CASCADE,
    CONSTRAINT `fk_wl_media` FOREIGN KEY (`media_ID`) REFERENCES `Media`(`media_ID`) ON DELETE CASCADE
);


-- 1. Role
INSERT INTO `Role` (`role_ID`, `role_name`) VALUES ('R1', 'Customer');
INSERT INTO `Role` (`role_ID`, `role_name`) VALUES ('R2', 'admin');

-- 2. SubscriptionPlan
INSERT INTO `SubscriptionPlan` (`plan_ID`, `plan_name`, `price`, `resolution`, `screen_count`) VALUES ('P1', 'Basic', 120000, '720p', 1);
INSERT INTO `SubscriptionPlan` (`plan_ID`, `plan_name`, `price`, `resolution`, `screen_count`) VALUES ('P2', 'Standard', 180000, '1080p', 2);
INSERT INTO `SubscriptionPlan` (`plan_ID`, `plan_name`, `price`, `resolution`, `screen_count`) VALUES ('P3', 'Premium', 260000, '4K', 4);

-- 3. Nationality (Đổi tên từ COUNTRY trong file cũ)
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('VN', 'Vietnam');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('GB', 'United Kingdom');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('US', 'United States');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('CA', 'Canada');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('CU', 'Cuba');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('CL', 'Chile');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('KR', 'South Korean');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('JP', 'Japan');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('CN', 'China');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('FR', 'France');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('DE', 'Germany');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('AU', 'Australia');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('RU', 'Russia');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('IT', 'Italy');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('ES', 'Spain');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('BR', 'Brazil');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('TH', 'Thailand');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('SG', 'Singapore');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('IN', 'India');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('CH', 'Switzerland');
INSERT INTO `Nationality` (`nationality_ID`, `nationality_name`) VALUES ('SE', 'Sweden');

-- 4. User
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U001', 'anna', 'anna@gmail.com', '123456', 'P1', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U002', 'john', 'john@yahoo.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U003', 'emma', 'emma@gmail.com', '123456', 'P3', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U004', 'victor', 'victor@mail.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U005', 'luna', 'luna@mail.com', '123456', 'P1', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U006', 'harry', 'harry@mail.com', '123456', 'P3', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U007', 'clara', 'clara@mail.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U008', 'felix', 'felix@mail.com', '123456', 'P1', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U009', 'kevin', 'kevin@mail.com', '123456', 'P3', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U010', 'yuri', 'yuri@mail.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U011', 'mary', 'mary@mail.com', '123456', 'P1', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U012', 'theo', 'theo@mail.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U013', 'alex', 'alex@mail.com', '123456', 'P3', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U014', 'sofia', 'sofia@mail.com', '123456', 'P2', 'R1');
INSERT INTO `User` (`user_ID`, `username`, `email`, `password`, `plan_ID`, `role_ID`) VALUES ('U015', 'ben', 'ben@mail.com', '123456', 'P3', 'R1');

-- 5. Genre
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G01', 'Sci-Fi');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G02', 'Action');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G03', 'Romance');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G04', 'Horror');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G05', 'Fantasy');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G06', 'Drama');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G07', 'Thriller');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G08', 'Mystery');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G09', 'Adventure');
INSERT INTO `Genre` (`genre_ID`, `genre_name`) VALUES ('G10', 'Animation');

-- 6. Actor (Lưu ý: Sửa tên cột nationality -> nationality_ID)
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A001', 'Henry', 'Cavill', '1983-05-05', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A002', 'Millie', 'Bobby Brown', '2004-02-19', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A003', 'Matthew', 'McConaughey', '1969-11-04', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A004', 'Ryan', 'Gosling', '1980-11-12', 'CA');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A005', 'TImothée', 'Chalamet', '1995-12-27', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A006', 'Florence', 'Pugh', '1996-01-03', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A007', 'Aaron', 'Paul', '1979-08-27', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A008', 'Bryan', 'Cranston', '1956-03-07', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A009', 'Emilia', 'Clarke', '1986-10-23', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A010', 'Kit', 'Harington', '1986-12-26', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A011', 'Pedro', 'Pascal', '1975-04-02', 'CL');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A012', 'Anya', 'Taylor-Joy', '1996-04-16', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A013', 'Rosamund', 'Pike', '1979-01-27', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A014', 'Zendaya', 'Stoermer Coleman', '1996-09-01', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A015', 'Jason', 'Momoa', '1979-08-01', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A016', 'Ana', 'de Armas', '1988-04-30', 'CU');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A017', 'Daniel', 'Kaluuya', '1989-02-24', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A018', 'Rami', 'Malek', '1981-05-12', 'US');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A019', 'Christian', 'Bale', '1974-01-30', 'GB');
INSERT INTO `Actor` (`actor_ID`, `first_name`, `last_name`, `birth_date`, `nationality_ID`) VALUES ('A020', 'Joaquin', 'Phoenix', '1974-10-28', 'US');

-- 7. Director (Lưu ý: Sửa tên cột nationality -> nationality_ID)
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D001', 'Christopher', 'Nolan', 'GB');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D002', 'Denis', 'Villeneuve', 'CA');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D003', 'Damien', 'Chazelle', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D004', 'Matt', 'Reeves', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D005', 'Joon-ho', 'Bong', 'KR');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D006', 'Todd', 'Phillips', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D007', 'The Duffer', 'Brothers', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D008', 'Vince', 'Gilligan', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D009', 'David', 'Benioff', 'US');
INSERT INTO `Director` (`director_ID`, `first_name`, `last_name`, `nationality_ID`) VALUES ('D010', 'Riot', 'Studios', 'US');

-- 8. Media
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M001', 'Interstellar', 'Movie', '2014-11-07', 'Sci-fi space journey');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M002', 'Inception', 'Movie', '2010-07-16', 'Dream heist');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M003', 'La La Land', 'Movie', '2016-12-09', 'Musical romance');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M004', 'The Dark Knight', 'Movie', '2008-07-18', 'Batman vs Joker');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M005', 'Dune', 'Movie', '2021-10-22', 'Desert sci-fi epic');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M006', 'Arrival', 'Movie', '2016-11-11', 'First contact story');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M007', 'Whiplash', 'Movie', '2014-10-10', 'Music drama');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M008', 'Gladiator', 'Movie', '2000-05-05', 'Roman revenge');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M009', 'Parasite', 'Movie', '2019-05-30', 'Social thriller');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M010', 'Joker', 'Movie', '2019-10-04', 'Character study');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M011', 'Stranger Things', 'Series', '2016-07-15', 'Sci-fi horror');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M012', 'The Witcher', 'Series', '2019-12-20', 'Monster hunter');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M013', 'Breaking Bad', 'Series', '2008-01-20', 'Chemistry teacher meth empire');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M014', 'Game of Thrones', 'Series', '2011-04-17', 'Epic fantasy');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M015', 'Money Heist', 'Series', '2017-05-02', 'Bank robbery');
INSERT INTO `Media` (`media_ID`, `title`, `type`, `release_date`, `description`) VALUES ('M016', 'Arcane', 'Series', '2021-11-06', 'Fantasy animation');

-- 9. Movie
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M001', 169, 677000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M002', 148, 836000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M003', 128, 446000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M004', 152, 1006000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M005', 155, 402000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M006', 118, 203000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M007', 107, 49000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M008', 155, 503000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M009', 132, 266000000);
INSERT INTO `Movie` (`media_ID`, `duration`, `box_office`) VALUES ('M010', 122, 1074000000);

-- 10. Series
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M011', 4);
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M012', 3);
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M013', 5);
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M014', 8);
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M015', 3);
INSERT INTO `Series` (`media_ID`, `total_seasons`) VALUES ('M016', 1);

-- 11. Episode
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E001', 'M011', 'Chapter One', 1, 49, '2016-07-15');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E002', 'M011', 'Chapter Two', 1, 55, '2016-07-15');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E003', 'M011', 'Chapter Three', 1, 51, '2016-07-15');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E004', 'M011', 'MADMAX', 2, 48, '2017-10-27');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E005', 'M011', 'Trick or Treat', 2, 56, '2017-10-27');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E006', 'M011', 'Suzie, Do You Copy?', 3, 50, '2019-07-04');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E007', 'M012', 'End’s Beginning', 1, 61, '2019-12-20');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E008', 'M012', 'Four Marks', 1, 60, '2019-12-20');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E009', 'M012', 'Betrayer Moon', 1, 67, '2019-12-20');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E010', 'M012', 'A Grain of Truth', 2, 61, '2021-12-17');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E011', 'M013', 'Pilot', 1, 58, '2008-01-20');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E012', 'M013', 'Cat’s in the Bag', 1, 48, '2008-01-27');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E013', 'M013', 'Gray Matter', 1, 47, '2008-02-24');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E017', 'M015', 'Episode 1', 1, 45, '2017-05-02');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E018', 'M015', 'Episode 2', 1, 48, '2017-05-02');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E019', 'M016', 'Welcome to the Playground', 1, 44, '2021-11-06');
INSERT INTO `Episode` (`episode_ID`, `media_ID`, `title`, `season_num`, `duration`, `release_date`) VALUES ('E020', 'M016', 'Some Mysteries', 1, 42, '2021-11-06');

-- 12. Media_Actor
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M001', 'A003');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M001', 'A019');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M002', 'A003');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M002', 'A018');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M003', 'A004');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M003', 'A016');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M004', 'A019');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M004', 'A020');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M005', 'A005');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M005', 'A014');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M006', 'A006');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M007', 'A016');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M008', 'A015');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M009', 'A005');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M009', 'A017');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M010', 'A020');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M011', 'A002');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M011', 'A010');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M012', 'A001');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M013', 'A007');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M013', 'A008');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M014', 'A009');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M014', 'A010');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M015', 'A011');
INSERT INTO `Media_Actor` (`media_ID`, `actor_ID`) VALUES ('M016', 'A012');

-- 13. Media_Director
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M001', 'D001');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M002', 'D001');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M003', 'D003');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M004', 'D004');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M005', 'D002');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M006', 'D002');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M007', 'D003');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M008', 'D004');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M009', 'D005');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M010', 'D006');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M011', 'D007');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M012', 'D001');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M013', 'D008');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M014', 'D009');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M015', 'D008');
INSERT INTO `Media_Director` (`media_ID`, `director_ID`) VALUES ('M016', 'D010');

-- 14. Media_Genre
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M001', 'G01');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M001', 'G09');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M002', 'G07');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M002', 'G01');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M003', 'G03');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M004', 'G02');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M004', 'G07');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M005', 'G01');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M006', 'G01');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M006', 'G08');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M007', 'G06');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M008', 'G02');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M009', 'G07');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M010', 'G06');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M011', 'G04');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M011', 'G08');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M012', 'G05');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M013', 'G06');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M013', 'G07');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M014', 'G05');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M015', 'G02');
INSERT INTO `Media_Genre` (`media_ID`, `genre_ID`) VALUES ('M016', 'G10');

-- 15. Rating
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U001', 'M001', 10, 'Amazing');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U001', 'M012', 9, 'Great adaptation');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U002', 'M002', 9, 'Mind-bending');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U002', 'M014', 8, 'Strong start');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U003', 'M009', 10, 'Brilliant');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U003', 'M010', 9, 'Intense');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U004', 'M004', 9, 'Iconic');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U004', 'M013', 8, 'Addictive');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U005', 'M005', 8, 'Impressive worldbuilding');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U005', 'M001', 9, 'Loved the visuals');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U006', 'M010', 10, 'Masterpiece performance');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U006', 'M011', 8, 'Enjoyable');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U007', 'M003', 7, 'Decent');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U007', 'M012', 8, 'Solid season');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U008', 'M008', 9, 'Epic story');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U008', 'M015', 8, 'Fun and fast-paced');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U009', 'M014', 7, 'Good but long');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U009', 'M001', 10, 'Fantastic');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U010', 'M016', 9, 'Beautiful animation');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U010', 'M005', 8, 'Strong visuals');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U011', 'M006', 7, 'Good');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U011', 'M003', 8, 'Nice music');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U012', 'M004', 10, 'Best Batman film');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U012', 'M002', 9, 'Amazing idea');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U013', 'M015', 8, 'Very cool');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U013', 'M009', 10, 'Perfect');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U014', 'M016', 9, 'Wonderful');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U015', 'M007', 7, 'Good drama');
INSERT INTO `Rating` (`user_ID`, `media_ID`, `score`, `comment`) VALUES ('U015', 'M003', 8, 'Lovely tone');

-- 16. WatchList
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U001', 'M001', '2024-02-10');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U001', 'M012', '2024-02-11');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U001', 'M016', '2024-02-15');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U002', 'M011', '2024-03-01');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U002', 'M014', '2024-03-05');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U002', 'M002', '2024-03-10');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U003', 'M015', '2024-01-18');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U003', 'M009', '2024-01-20');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U003', 'M010', '2024-01-25');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U004', 'M013', '2024-02-05');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U004', 'M002', '2024-02-06');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U004', 'M014', '2024-02-10');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U005', 'M005', '2024-02-12');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U005', 'M001', '2024-02-13');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U005', 'M007', '2024-02-16');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U006', 'M010', '2024-01-28');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U006', 'M004', '2024-01-30');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U006', 'M011', '2024-02-02');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U007', 'M009', '2024-02-05');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U007', 'M003', '2024-02-06');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U007', 'M012', '2024-02-07');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U008', 'M008', '2024-02-10');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U008', 'M015', '2024-02-12');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U009', 'M001', '2024-02-14');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U009', 'M013', '2024-02-15');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U009', 'M014', '2024-02-18');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U010', 'M011', '2024-02-20');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U010', 'M016', '2024-02-21');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U010', 'M005', '2024-02-22');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U011', 'M003', '2024-02-05');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U011', 'M006', '2024-02-06');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U012', 'M004', '2024-02-09');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U012', 'M002', '2024-02-10');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U012', 'M012', '2024-02-11');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U013', 'M015', '2024-02-14');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U013', 'M009', '2024-02-15');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U014', 'M016', '2024-02-20');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U014', 'M001', '2024-02-21');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U015', 'M007', '2024-02-25');
INSERT INTO `WatchList` (`user_ID`, `media_ID`, `date_added`) VALUES ('U015', 'M003', '2024-02-26');
