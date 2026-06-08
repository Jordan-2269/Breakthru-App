INSERT INTO public.service_types (name, category, icon_name) VALUES
  ('ABA Therapy',              'Behavioral',     'brain-circuit'),
  ('Applied Behavior Analysis','Behavioral',     'brain-circuit'),
  ('Social Skills Training',   'Behavioral',     'users'),
  ('Speech Therapy',           'Communication',  'message-circle'),
  ('Social Stories',           'Communication',  'book-open'),
  ('Occupational Therapy',     'Sensory/Motor',  'hand'),
  ('Sensory Integration',      'Sensory/Motor',  'sparkles'),
  ('Physical Therapy',         'Sensory/Motor',  'activity'),
  ('Feeding Therapy',          'Sensory/Motor',  'utensils'),
  ('Early Intervention',       'Developmental',  'seedling'),
  ('DIR/Floortime',            'Developmental',  'child'),
  ('RDI Therapy',              'Developmental',  'compass'),
  ('Music Therapy',            'Creative',       'music'),
  ('Art Therapy',              'Creative',       'palette'),
  ('Parent Training',          'Support',        'users')
ON CONFLICT (name) DO NOTHING;
