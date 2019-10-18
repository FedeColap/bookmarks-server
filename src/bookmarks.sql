-- First, remove the table if it exists
drop table if exists bookmarks;

--create the new table
create table bookmarks (
    id INTEGER primary key generated by default as identity, 
    bm_name text, 
    bm_url text, 
    bm_desc text, 
    rating integer 
);
-- insert some test data
-- Using a multi-row insert statement here
-- insert into bookmarks (bm_name, bm_url, rating )
-- values 
-- ('Etsy', 'https://www.etsy.com/', '5'),
-- ('Twitter', 'https://twitter.com/login?redirect_after_login=%2Fhome', '4'),
-- ('Google News', 'https://news.google.com/?hl=en-US&gl=US&ceid=US:en', '3'),
-- ('OVS', 'https://www.ovsfashion.com/', '2'),
-- ('Youtube', 'https://www.youtube.com/', '5'),
-- ('Google', 'https://www.google.com/', '3'),
-- ('Il Corriere della Sera', 'https://www.corriere.it/', '3'),
-- ('Chi Chi London', 'https://www.chichiclothing.com/', '3');
