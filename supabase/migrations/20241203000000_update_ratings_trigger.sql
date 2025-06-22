CREATE OR REPLACE FUNCTION public.update_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating REAL;
  review_count INT;
BEGIN
  -- When a review is inserted, updated, or deleted, recalculate for the affected worker.
  -- The NEW and OLD variables contain the row that was affected.
  -- In the case of a DELETE, NEW is null. In INSERT, OLD is null.
  WITH review_stats AS (
    SELECT
      AVG(rating) as average,
      COUNT(id) as total
    FROM public.reviews
    WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id)
  )
  SELECT average, total INTO avg_rating, review_count FROM review_stats;
  
  UPDATE public.workers
  SET 
    average_rating = COALESCE(avg_rating, 0),
    total_reviews = COALESCE(review_count, 0)
  WHERE id = COALESCE(NEW.worker_id, OLD.worker_id);
  
  RETURN NULL; -- The return value is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then re-create it.
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_worker_rating(); 