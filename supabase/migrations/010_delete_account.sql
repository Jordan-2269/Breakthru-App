-- Allows a signed-in user to permanently delete their own account.
-- SECURITY DEFINER runs with elevated privileges so it can delete from auth.users.
-- The CASCADE on profiles.id → auth.users.id handles cleanup of all child rows.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
