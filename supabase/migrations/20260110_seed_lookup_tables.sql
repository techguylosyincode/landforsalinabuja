-- Seed data for lookup tables

-- Locations (Abuja Districts)
INSERT INTO locations (id, name, slug) VALUES
  (gen_random_uuid(), 'Asokoro', 'asokoro'),
  (gen_random_uuid(), 'Maitama', 'maitama'),
  (gen_random_uuid(), 'Wuse', 'wuse'),
  (gen_random_uuid(), 'Wuse 2', 'wuse-2'),
  (gen_random_uuid(), 'Garki', 'garki'),
  (gen_random_uuid(), 'Garki 2', 'garki-2'),
  (gen_random_uuid(), 'Gwarinpa', 'gwarinpa'),
  (gen_random_uuid(), 'Jabi', 'jabi'),
  (gen_random_uuid(), 'Utako', 'utako'),
  (gen_random_uuid(), 'Katampe', 'katampe'),
  (gen_random_uuid(), 'Katampe Extension', 'katampe-extension'),
  (gen_random_uuid(), 'Life Camp', 'life-camp'),
  (gen_random_uuid(), 'Kado', 'kado'),
  (gen_random_uuid(), 'Guzape', 'guzape'),
  (gen_random_uuid(), 'Lugbe', 'lugbe'),
  (gen_random_uuid(), 'Kubwa', 'kubwa'),
  (gen_random_uuid(), 'Lokogoma', 'lokogoma'),
  (gen_random_uuid(), 'Kaura', 'kaura'),
  (gen_random_uuid(), 'Durumi', 'durumi'),
  (gen_random_uuid(), 'Gudu', 'gudu'),
  (gen_random_uuid(), 'Apo', 'apo'),
  (gen_random_uuid(), 'Wuye', 'wuye'),
  (gen_random_uuid(), 'Mabushi', 'mabushi'),
  (gen_random_uuid(), 'Jahi', 'jahi'),
  (gen_random_uuid(), 'Karsana', 'karsana'),
  (gen_random_uuid(), 'Dei-Dei', 'dei-dei'),
  (gen_random_uuid(), 'Dutse', 'dutse'),
  (gen_random_uuid(), 'Mpape', 'mpape'),
  (gen_random_uuid(), 'Nyanya', 'nyanya'),
  (gen_random_uuid(), 'Karu', 'karu'),
  (gen_random_uuid(), 'Kurudu', 'kurudu'),
  (gen_random_uuid(), 'Orozo', 'orozo'),
  (gen_random_uuid(), 'Karmo', 'karmo'),
  (gen_random_uuid(), 'Idu', 'idu'),
  (gen_random_uuid(), 'Gwagwalada', 'gwagwalada'),
  (gen_random_uuid(), 'Kuje', 'kuje')
ON CONFLICT DO NOTHING;

-- Land Types
INSERT INTO land_types (id, name, slug) VALUES
  (gen_random_uuid(), 'Residential', 'residential'),
  (gen_random_uuid(), 'Commercial', 'commercial'),
  (gen_random_uuid(), 'Mixed Use', 'mixed-use'),
  (gen_random_uuid(), 'Industrial', 'industrial'),
  (gen_random_uuid(), 'Agricultural', 'agricultural'),
  (gen_random_uuid(), 'Institutional', 'institutional')
ON CONFLICT DO NOTHING;

-- Popular Estates in Abuja
INSERT INTO estates (id, name, slug) VALUES
  (gen_random_uuid(), 'Gwarinpa Estate', 'gwarinpa-estate'),
  (gen_random_uuid(), 'Asokoro Extension', 'asokoro-extension'),
  (gen_random_uuid(), 'Maitama Extension', 'maitama-extension'),
  (gen_random_uuid(), 'Life Camp Estate', 'life-camp-estate'),
  (gen_random_uuid(), 'Jabi Lake Estate', 'jabi-lake-estate'),
  (gen_random_uuid(), 'Katampe Extension', 'katampe-extension'),
  (gen_random_uuid(), 'Lokogoma Estate', 'lokogoma-estate'),
  (gen_random_uuid(), 'Lugbe FHA', 'lugbe-fha'),
  (gen_random_uuid(), 'Kubwa FHA', 'kubwa-fha'),
  (gen_random_uuid(), 'Apo Legislative Quarters', 'apo-legislative-quarters'),
  (gen_random_uuid(), 'Apo Resettlement', 'apo-resettlement'),
  (gen_random_uuid(), 'Games Village', 'games-village'),
  (gen_random_uuid(), 'Kaura District', 'kaura-district'),
  (gen_random_uuid(), 'Wuye District', 'wuye-district'),
  (gen_random_uuid(), 'Kado Estate', 'kado-estate'),
  (gen_random_uuid(), 'Guzape District', 'guzape-district'),
  (gen_random_uuid(), 'Durumi District', 'durumi-district'),
  (gen_random_uuid(), 'Gudu District', 'gudu-district'),
  (gen_random_uuid(), 'Sun City Estate', 'sun-city-estate'),
  (gen_random_uuid(), 'River Park Estate', 'river-park-estate'),
  (gen_random_uuid(), 'Brains and Hammers', 'brains-and-hammers'),
  (gen_random_uuid(), 'Efab Metropolis', 'efab-metropolis'),
  (gen_random_uuid(), 'Citiview Estate', 'citiview-estate'),
  (gen_random_uuid(), 'Royal Palm Estate', 'royal-palm-estate'),
  (gen_random_uuid(), 'Prince and Princess Estate', 'prince-and-princess-estate')
ON CONFLICT DO NOTHING;
