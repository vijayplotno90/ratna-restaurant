-- Demo-only access and operational data for Ratna's first review.
-- Replace these passwords and remove demo records before live staff access.
update public.ratna_team_users
set password_hash = crypt('0000', gen_salt('bf', 12)), updated_at = now()
where user_id in ('owner_demo', 'admin_demo');

insert into public.ratna_orders (id, customer_name, customer_phone, fulfilment, delivery_address, payment_method, status, subtotal, delivery_fee, gst_amount, total, notes, created_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Aarav Reddy', '9876543210', 'delivery', 'Sainikpuri, Hyderabad', 'upi', 'out', 750, 0, 38, 788, 'Mild spice, please', now() - interval '1 day'),
  ('a0000000-0000-4000-8000-000000000002', 'Meera Shah', '9876543211', 'pickup', null, 'card', 'ready', 445, 0, 22, 467, null, now() - interval '2 days'),
  ('a0000000-0000-4000-8000-000000000003', 'Aarav Reddy', '9876543210', 'delivery', 'Sainikpuri, Hyderabad', 'upi', 'delivered', 400, 0, 20, 420, null, now() - interval '5 days'),
  ('a0000000-0000-4000-8000-000000000004', 'Nikhil Varma', '9876543212', 'pickup', null, 'upi', 'delivered', 530, 0, 27, 557, null, now() - interval '9 days'),
  ('a0000000-0000-4000-8000-000000000005', 'Fatima Khan', '9876543213', 'delivery', 'ECIL, Hyderabad', 'cod', 'delivered', 640, 30, 34, 704, null, now() - interval '18 days'),
  ('a0000000-0000-4000-8000-000000000006', 'Nikhil Varma', '9876543212', 'pickup', null, 'card', 'delivered', 370, 0, 19, 389, null, now() - interval '34 days'),
  ('a0000000-0000-4000-8000-000000000007', 'Aarav Reddy', '9876543210', 'delivery', 'Sainikpuri, Hyderabad', 'upi', 'delivered', 340, 0, 17, 357, null, now() - interval '47 days'),
  ('a0000000-0000-4000-8000-000000000008', 'Saanvi Rao', '9876543214', 'pickup', null, 'upi', 'delivered', 380, 0, 19, 399, null, now() - interval '64 days')
on conflict (id) do nothing;

insert into public.ratna_order_items (order_id, menu_item_id, item_name, quantity, unit_price) values
  ('a0000000-0000-4000-8000-000000000001', 'chicken-dum-biryani', 'Chicken Dum Biryani', 2, 320), ('a0000000-0000-4000-8000-000000000001', 'double-ka-meetha', 'Double Ka Meetha', 1, 110),
  ('a0000000-0000-4000-8000-000000000002', 'paneer-tikka', 'Paneer Tikka', 1, 280), ('a0000000-0000-4000-8000-000000000002', 'butter-naan', 'Butter Naan', 3, 55),
  ('a0000000-0000-4000-8000-000000000003', 'chicken-65', 'Chicken 65', 1, 220), ('a0000000-0000-4000-8000-000000000003', 'veg-fried-rice', 'Veg Fried Rice', 1, 180),
  ('a0000000-0000-4000-8000-000000000004', 'mutton-dum-biryani', 'Mutton Dum Biryani', 1, 390), ('a0000000-0000-4000-8000-000000000004', 'fresh-lime-soda', 'Fresh Lime Soda', 2, 70),
  ('a0000000-0000-4000-8000-000000000005', 'veg-dum-biryani', 'Veg Dum Biryani', 2, 230), ('a0000000-0000-4000-8000-000000000005', 'gulab-jamun', 'Gulab Jamun', 2, 90),
  ('a0000000-0000-4000-8000-000000000006', 'chicken-tikka', 'Chicken Tikka', 1, 260), ('a0000000-0000-4000-8000-000000000006', 'butter-naan', 'Butter Naan', 2, 55),
  ('a0000000-0000-4000-8000-000000000007', 'chicken-frypiece-biryani', 'Chicken Fry Piece Biryani', 1, 340),
  ('a0000000-0000-4000-8000-000000000008', 'paneer-butter-masala', 'Paneer Butter Masala', 1, 240), ('a0000000-0000-4000-8000-000000000008', 'tandoori-roti', 'Tandoori Roti', 4, 35)
on conflict do nothing;
