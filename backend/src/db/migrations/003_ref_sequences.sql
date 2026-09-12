-- 003_ref_sequences.sql
-- Backs the human-readable RQ-YYYY-NNNN / QT-YYYY-NNNN references minted in
-- src/lib/refs.ts. Kept as sequences, separate from the tables, so numbering is
-- gap-free-ish and independent of row lifecycle (a rolled-back insert doesn't
-- reuse a number).

CREATE SEQUENCE requirement_ref_seq;
CREATE SEQUENCE quotation_ref_seq;
