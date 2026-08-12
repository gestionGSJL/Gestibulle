-- Onboarding RPCs: create a brand-new family, or accept a pending invite.
-- Both run as the invoking user and are the only way client code creates a
-- family_members row for auth.uid(), keeping "one family per user" intact.

create or replace function create_family_for_new_user(p_family_name text, p_member_name text)
returns uuid as $$
declare
  v_family_id uuid;
  v_member_id uuid;
  v_seed record;
begin
  if exists (select 1 from family_members where user_id = auth.uid()) then
    raise exception 'user already belongs to a family';
  end if;

  insert into families (name) values (coalesce(nullif(trim(p_family_name), ''), 'Ma famille'))
    returning id into v_family_id;

  insert into family_members (family_id, user_id, name, email, role, color_index)
    values (v_family_id, auth.uid(), coalesce(nullif(trim(p_member_name), ''), 'Moi'),
            (select email from auth.users where id = auth.uid()), 'owner', 0)
    returning id into v_member_id;

  insert into app_prefs (family_id) values (v_family_id);
  insert into notification_prefs (family_member_id) values (v_member_id);

  for v_seed in select * from (values
    ('Poulet parmesan', '35 min', 'Plat principal', array['Poitrines de poulet','Chapelure','Parmesan râpé','Sauce tomate','Mozzarella','Pâtes courtes']),
    ('Buddha bowl au tofu', '25 min', 'Végétarien', array['Tofu ferme','Riz basmati','Brocoli','Carottes','Sauce tahini','Graines de sésame']),
    ('Chili sin carne', '40 min', 'Mijoté', array['Haricots rouges','Haricots noirs','Tomates en dés','Maïs','Oignon','Épices à chili']),
    ('Saumon grillé & légumes', '30 min', 'Poisson', array['Filets de saumon','Asperges','Citron','Huile d''olive','Aneth frais','Pommes de terre grelot']),
    ('Pâtes au pesto', '20 min', 'Rapide', array['Pâtes longues','Basilic frais','Pignons de pin','Parmesan','Ail','Huile d''olive']),
    ('Tacos au poulet', '30 min', 'Mexicain', array['Tortillas','Poulet effiloché','Salsa','Avocat','Coriandre fraîche','Lime'])
  ) as t(name, prep_time, tag, ingredients)
  loop
    insert into recipes (family_id, name, prep_time, tag, ingredients)
      values (v_family_id, v_seed.name, v_seed.prep_time, v_seed.tag, v_seed.ingredients);
  end loop;

  return v_family_id;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function pending_invite_for_current_user()
returns table (id uuid, family_id uuid, family_name text, email text) as $$
  select i.id, i.family_id, f.name, i.email
  from invites i
  join families f on f.id = i.family_id
  where i.status = 'pending'
    and lower(i.email) = lower((select email from auth.users where id = auth.uid()))
  order by i.created_at desc
  limit 1;
$$ language sql stable security definer set search_path = public;

create or replace function accept_invite(p_invite_id uuid, p_member_name text)
returns uuid as $$
declare
  v_family_id uuid;
  v_member_id uuid;
begin
  if exists (select 1 from family_members where user_id = auth.uid()) then
    raise exception 'user already belongs to a family';
  end if;

  select family_id into v_family_id from invites
    where id = p_invite_id and status = 'pending'
      and lower(email) = lower((select email from auth.users where id = auth.uid()));

  if v_family_id is null then
    raise exception 'invite not found or already used';
  end if;

  insert into family_members (family_id, user_id, name, email, role, color_index)
    values (v_family_id, auth.uid(), coalesce(nullif(trim(p_member_name), ''), 'Membre'),
            (select email from auth.users where id = auth.uid()), 'member',
            (select count(*) from family_members where family_id = v_family_id))
    returning id into v_member_id;

  update invites set status = 'accepted' where id = p_invite_id;
  insert into notification_prefs (family_member_id) values (v_member_id);

  return v_family_id;
end;
$$ language plpgsql security definer set search_path = public;
