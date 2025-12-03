-- Update drop_in_pricing with new Stripe product IDs (CAD pricing)

UPDATE public.drop_in_pricing
SET 
  stripe_price_id = 'price_1Sa46oC2I88MOqJ1EoippchK',
  stripe_product_id = 'prod_TX8NXeBVG5Op9s'
WHERE stripe_price_id IS NULL 
   OR stripe_product_id IS NULL
   OR stripe_product_id LIKE 'prod_TR0%'; -- Update old products

-- Verify the update
SELECT 
  dp.id,
  s.name as sport_name,
  dp.price,
  dp.duration_minutes,
  dp.stripe_price_id,
  dp.stripe_product_id
FROM public.drop_in_pricing dp
JOIN public.sports s ON dp.sport_id = s.id
ORDER BY s.name, dp.duration_minutes;
