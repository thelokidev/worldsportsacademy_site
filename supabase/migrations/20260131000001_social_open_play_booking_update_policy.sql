-- Allow users to update their own social_open_play_bookings (for payment confirmation)
CREATE POLICY "Users can update their own social play bookings"
  ON public.social_open_play_bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
