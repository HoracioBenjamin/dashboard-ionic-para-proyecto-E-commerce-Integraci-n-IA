-- Portada opcional de categorías, con el mismo campo usado en marcas.
ALTER TABLE public.categorias
  ADD COLUMN IF NOT EXISTS imagen_portada text;

NOTIFY pgrst, 'reload schema';
