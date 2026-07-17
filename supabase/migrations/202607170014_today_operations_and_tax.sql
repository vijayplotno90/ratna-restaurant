-- Fresh demonstration activity for a live restaurant day.
insert into public.ratna_orders (id, customer_name, customer_phone, fulfilment, payment_method, status, subtotal, delivery_fee, gst_amount, total, created_at) values
  ('f1000000-0000-4000-8000-000000000001', 'Vijay Kumar', '9876543250', 'delivery', 'upi', 'out', 520, 0, 26, 546, now() - interval '18 minutes'),
  ('f1000000-0000-4000-8000-000000000002', 'Anjali Reddy', '9876543251', 'pickup', 'card', 'ready', 410, 0, 21, 431, now() - interval '44 minutes'),
  ('f1000000-0000-4000-8000-000000000003', 'Karthik Shah', '9876543252', 'delivery', 'upi', 'preparing', 680, 0, 34, 714, now() - interval '92 minutes'),
  ('f1000000-0000-4000-8000-000000000004', 'Fathima Begum', '9876543253', 'pickup', 'upi', 'delivered', 350, 0, 18, 368, now() - interval '3 hours'),
  ('f1000000-0000-4000-8000-000000000005', 'Srinivas Rao', '9876543254', 'delivery', 'cod', 'delivered', 760, 30, 40, 830, now() - interval '5 hours')
on conflict (id) do nothing;

insert into public.ratna_order_items (order_id, menu_item_id, item_name, quantity, unit_price) values
  ('f1000000-0000-4000-8000-000000000001','chicken-biryani','Chicken Dum Biryani',2,220),('f1000000-0000-4000-8000-000000000001','double-meetha','Double Ka Meetha',1,80),
  ('f1000000-0000-4000-8000-000000000002','paneer-tikka','Paneer Tikka',1,180),('f1000000-0000-4000-8000-000000000002','butter-naan','Butter Naan',3,50),
  ('f1000000-0000-4000-8000-000000000003','mutton-biryani','Mutton Dum Biryani',1,320),('f1000000-0000-4000-8000-000000000003','chicken-65','Chicken 65',1,220),('f1000000-0000-4000-8000-000000000003','chicken-hakka','Chicken Hakka Noodles',1,200),
  ('f1000000-0000-4000-8000-000000000004','veg-biryani','Veg Dum Biryani',1,160),('f1000000-0000-4000-8000-000000000004','paneer-majestic','Paneer Majestic',1,190),
  ('f1000000-0000-4000-8000-000000000005','chicken-fry-biryani','Chicken Fry Piece Biryani',2,260),('f1000000-0000-4000-8000-000000000005','chicken-65','Chicken 65',1,220),('f1000000-0000-4000-8000-000000000005','mango-lassi','Mango Lassi',2,100);
