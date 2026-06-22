BEGIN;

INSERT INTO companies (nome, cnpj, telefone)
VALUES
  ('Tech Distribuidora LTDA', '12.345.678/0001-90', '(11) 4002-8922'),
  ('Mercado Central SA', '23.456.789/0001-10', '(21) 3555-1200'),
  ('Alpha Informatica ME', '34.567.890/0001-21', '(31) 98888-7700'),
  ('Papelaria Horizonte LTDA', '45.678.901/0001-32', '(41) 3333-9090'),
  ('Casa do Hardware LTDA', '56.789.012/0001-43', '(51) 97777-1000')
ON CONFLICT (cnpj)
DO UPDATE SET
  nome = EXCLUDED.nome,
  telefone = EXCLUDED.telefone;

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Notebook Lenovo Ideapad 15', 3499.90, 12, c.id
FROM companies c
WHERE c.cnpj = '12.345.678/0001-90'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Notebook Lenovo Ideapad 15'
      AND p.empresa_id = c.id
  );

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Mouse sem fio Logitech M170', 79.90, 45, c.id
FROM companies c
WHERE c.cnpj = '12.345.678/0001-90'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Mouse sem fio Logitech M170'
      AND p.empresa_id = c.id
  );

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Arroz tipo 1 5kg', 24.99, 80, c.id
FROM companies c
WHERE c.cnpj = '23.456.789/0001-10'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Arroz tipo 1 5kg'
      AND p.empresa_id = c.id
  );

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Monitor LED 24 polegadas', 899.00, 18, c.id
FROM companies c
WHERE c.cnpj = '34.567.890/0001-21'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Monitor LED 24 polegadas'
      AND p.empresa_id = c.id
  );

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Caderno universitario 200 folhas', 18.50, 120, c.id
FROM companies c
WHERE c.cnpj = '45.678.901/0001-32'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Caderno universitario 200 folhas'
      AND p.empresa_id = c.id
  );

INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
SELECT 'Teclado mecanico ABNT2', 249.90, 25, c.id
FROM companies c
WHERE c.cnpj = '56.789.012/0001-43'
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.nome = 'Teclado mecanico ABNT2'
      AND p.empresa_id = c.id
  );

COMMIT;

SELECT
  p.id,
  p.nome,
  p.preco,
  p.quantidade_estoque,
  c.nome AS empresa
FROM products p
INNER JOIN companies c
  ON c.id = p.empresa_id
ORDER BY p.id;
