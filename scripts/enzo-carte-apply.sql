-- ============================================================
-- enzo-carte-apply.sql — Mise à jour carte Enzo Pizza oct 2026
-- Exécuter dans le SQL Editor de Supabase.
-- ============================================================

BEGIN;

DO $guard$
DECLARE
  v_bid uuid;
  v_specials_before jsonb;
  v_announcement_before text;
  v_specials_after jsonb;
  v_announcement_after text;
  v_menu_rows int;
  v_infos_rows int;
  v_new_menu jsonb;
  v_new_hours jsonb;
BEGIN
  -- 1. Trouver le business
  SELECT id INTO v_bid FROM public.businesses WHERE slug = 'enzo-pizza';
  IF v_bid IS NULL THEN
    RAISE EXCEPTION 'Business enzo-pizza introuvable';
  END IF;

  -- 2. Snapshot avant modification (garde-fou)
  SELECT data INTO v_specials_before
    FROM public.site_content
    WHERE business_id = v_bid AND section_key = 'specials';

  SELECT data->>'announcement' INTO v_announcement_before
    FROM public.site_content
    WHERE business_id = v_bid AND section_key = 'infos';

  -- 3. Nouveau menu
  v_new_menu := $menu$
{
  "categories": [
    {
      "id": "classiques",
      "name": "Pizzas",
      "tagline": "Origan et olives sur toutes les pizzas",
      "items": [
        {"id":"olio","name":"Olio","description":"Pâte à pizza, huile d\u2019olive, origan, sel.","price":5.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"marinara","name":"Marinara","description":"Base tomate, ail, huile d\u2019olive.","price":11.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"anchois","name":"Anchois","description":"Base tomate, anchois, ail, olives.","price":12.9,"priceNote":null,"tags":[],"available":true},
        {"id":"la-bonne-mere","name":"La Bonne Mère","description":"Base tomate moitié-moitié, anchois, emmental.","price":13.5,"priceNote":null,"tags":[],"available":true},
        {"id":"margherita","name":"Margherita","description":"Base tomate, mozzarella fior di latte, basilou.","price":11.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"quattro-formaggi","name":"4 Fromages","description":"Base tomate ou crème, taleggio, emmental, mozzarella fior di latte, gorgonzola.","price":14.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"salamech","name":"Piquante","description":"Base tomate, spianata, mozzarella fior di latte.","price":12.9,"priceNote":null,"tags":["epice"],"available":true},
        {"id":"romaine","name":"Romaine","description":"Base tomate, jambon blanc, mozzarella fior di latte.","price":12.9,"priceNote":null,"tags":[],"available":true},
        {"id":"regina","name":"Regina","description":"Base tomate, jambon blanc, champignons frais, mozzarella fior di latte. Supplément œuf : 1,50 \u20ac.","price":13.9,"priceNote":null,"tags":[],"available":true},
        {"id":"pepe","name":"Pépé","description":"Base tomate, pepperoni, mozzarella fior di latte.","price":13.5,"priceNote":null,"tags":[],"available":true},
        {"id":"miele","name":"Miele","description":"Base crème, cabécou, mozzarella fior di latte.","price":14.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"mama","name":"Mama","description":"Base tomate, spianata, guanciale, mozzarella fior di latte, jambon cru, basilou.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"tchatchouka","name":"Tchatchouka","description":"Base tomate, oignons confits, poivrons, mozzarella fior di latte, œuf.","price":13.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"carbonara","name":"Carbonara","description":"Crème de grana, guanciale, mozzarella fior di latte, copeaux de pecorino, œuf, grains de poivre.","price":14.9,"priceNote":null,"tags":[],"available":true},
        {"id":"parmigiana","name":"Parmigiana","description":"Base tomate, aubergines frites, crème de grana, mozzarella fior di latte, copeaux de grana, basilou.","price":15.5,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"provencale","name":"Provençale","description":"Base tomate, aubergines frites, ail, oignons confits, poivrons marinés, viande hachée, mozzarella fior di latte, romarin.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"donald","name":"Kentucky","description":"Base tomate, cheddar, viande hachée, mozzarella fior di latte, sauce burger, oignons rouges, chips de guanciale.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"verdura-d-hiver","name":"Verdura d\u2019Hiver","description":"Base crème, oignons confits, butternut, champignons frais, pesto de noix, éclats de noix, jeunes pousses.","price":15.5,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"tartichouette","name":"Tartichouette","description":"Base crème, guanciale, oignons confits, pommes de terre rôties au four, taleggio, mozzarella fior di latte.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"pizza-raclettement-bon","name":"Raclettement Bon","description":"Crème d\u2019oignons confits, raclette, oignons confits, mozzarella fior di latte, pancetta rôtie, jeunes pousses.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"dimanche-soir","name":"Dimanche Soir","description":"Crème, raclette, pommes de terre rôties au four, mozzarella fior di latte, jambon blanc, oignons rouges.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"pizza-noti","name":"Noti","description":"Crème de butternut, butternut, fontina, mozzarella fior di latte, speck, graines de courge, ail fumé.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"renaud","name":"Renaud","description":"Crème de butternut, butternut, guanciale, mozzarella fior di latte, pesto de noix, noix, burrata, jeunes pousses.","price":17.9,"priceNote":null,"tags":[],"available":true},
        {"id":"pizza-castagna","name":"Castagna","description":"Crème de châtaigne, fontina, mozzarella fior di latte, copeaux de grana, speck, éclats de châtaigne.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"la-gigi","name":"La Gigi","description":"Base crème ou tomate, fontina, taleggio, reblochon, mozzarella fior di latte, copeaux de pecorino.","price":16.5,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"louise","name":"Louise","description":"Base crème, cabécou, pancetta, thym, mozzarella fior di latte, crumble thym-miel, miel.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"gaston","name":"Gaston","description":"Crème d\u2019oignons confits, reblochon, pommes de terre rôties, oignons confits, mozzarella, jambon blanc.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"amo","name":"Amore","description":"Base tomate, mozzarella fior di latte, jambon cru, jeunes pousses, burrata, pesto genovese, copeaux de grana, pignons.","price":17.9,"priceNote":null,"tags":["coup-de-coeur"],"available":true},
        {"id":"moussaka","name":"Moussaka","description":"Sauce tomate, aubergines, sauge, viande hachée, crème, mozzarella fior di latte.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"marakchi","name":"Marakchi","description":"Base crème, sauce blanche, oignons confits, kebab, mozzarella fior di latte.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"benedicte","name":"Bénédicte","description":"Base crème, gorgonzola, jambon blanc, champignons frais, mozzarella fior di latte, œuf.","price":15.9,"priceNote":null,"tags":[],"available":true}
      ]
    },
    {
      "id": "pates",
      "name": "Pâtes fraîches",
      "tagline": "faites maison, chaque jour",
      "items": [
        {"id":"gnocchis-detail","name":"Gnocchis frais au poids","description":"Nos gnocchis sont façonnés sur place pour vous garantir une fraîcheur et une légèreté incomparables.","price":0.99,"priceNote":"/ 100 g","tags":["veggie"],"available":true},
        {"id":"gnocchis-inspi-carbo","name":"Inspi Carbo","description":"Crème de grana, chips de guanciale, copeaux de pecorino, grains de poivre, jaune d\u2019œuf.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"gnocchi-castagna","name":"Castagna","description":"Crème de châtaigne, speck, copeaux de grana, émietté de châtaignes.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"gnocchi-raclettement-bon","name":"Raclettement Bon","description":"Crème d\u2019oignons confits, raclette, oignons confits, pancetta rôtie.","price":16.9,"priceNote":null,"tags":[],"available":true},
        {"id":"pigno","name":"Pigno","description":"Pesto genovese, pignons, copeaux de grana.","price":13.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"zola-et-guancia","name":"Zola et Guancia","description":"Crème de gorgonzola, chips de guanciale.","price":15.9,"priceNote":null,"tags":[],"available":true},
        {"id":"ala-bolo","name":"Ala Bolo","description":"Sauce tomate, viande hachée, copeaux de grana.","price":14.9,"priceNote":null,"tags":[],"available":true},
        {"id":"gnocchi-noti","name":"Noti","description":"Crème de butternut, butternut, burrata, speck, graines de courge.","price":null,"priceNote":"Prix sur place","tags":[],"available":true},
        {"id":"gnocchis-frits","name":"Gnocchis frits au cheddar","description":"Gnocchis frits au cheddar.","price":null,"priceNote":"M 9,90 \u20ac \u00b7 L 14,90 \u20ac","tags":["veggie"],"available":true},
        {"id":"raviolis-frais","name":"Raviolis frais","description":"Une fois par semaine, réalisés à la main (vendredi, samedi ou dimanche). Recette à l\u2019ardoise.","price":null,"priceNote":"Prix selon composition","tags":[],"available":true}
      ]
    },
    {
      "id": "partager",
      "name": "À partager",
      "tagline": "\u2026 ou pas",
      "items": [
        {"id":"focaccia-fraiche","name":"Focaccia fraîche","description":"Une fois par semaine.","price":3.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"burrata-classique","name":"Burrata","description":"Roquette, pesto genovese, pignons.","price":7.9,"priceNote":null,"tags":["veggie"],"available":true},
        {"id":"burrata-parmigiana","name":"Burrata Parmigiana","description":"Sauce tomate, aubergines, burrata, basilou, copeaux de grana.","price":8.9,"priceNote":null,"tags":["veggie"],"available":true}
      ]
    },
    {
      "id": "desserts",
      "name": "Desserts",
      "tagline": "pour finir en douceur",
      "items": [
        {"id":"tiramisu","name":"Tiramisu","description":"Goût du jour.","price":4.9,"priceNote":null,"tags":[],"available":true},
        {"id":"piccola-nutella","name":"Piccola","description":"Petite pizza remplie de douceur : mascarpone au Nutella, à la crème de marron ou à la noisette (1 au choix).","price":12.9,"priceNote":null,"tags":[],"available":true},
        {"id":"zeppoline","name":"Zeppoline","description":"Beignets de pâte à pizza frits, presque mieux qu\u2019un churros. Garniture au choix : Nutella, pistache, noisette, crème de marron, chocolat ou caramel.","price":null,"priceNote":"Au sucre 9,90 \u20ac \u00b7 Garnie 11,90 \u20ac","tags":[],"available":true}
      ]
    }
  ],
  "supplements": [
    {"id":"sup-burrata","name":"Burrata","price":5},
    {"id":"sup-legumes","name":"Légumes","price":2.9},
    {"id":"sup-fromage","name":"Fromages","price":3.9},
    {"id":"sup-charcuterie","name":"Charcuterie ou viande","price":4.9}
  ]
}
  $menu$::jsonb;

  -- 4. Nouveaux horaires (hiver : lun-mar fermé, mer-dim 16h30-21h30)
  v_new_hours := $hours$
{
  "mon": {"closed": true,  "slots": []},
  "tue": {"closed": true,  "slots": []},
  "wed": {"closed": false, "slots": [{"open": "16:30", "close": "21:30"}]},
  "thu": {"closed": false, "slots": [{"open": "16:30", "close": "21:30"}]},
  "fri": {"closed": false, "slots": [{"open": "16:30", "close": "21:30"}]},
  "sat": {"closed": false, "slots": [{"open": "16:30", "close": "21:30"}]},
  "sun": {"closed": false, "slots": [{"open": "16:30", "close": "21:30"}]}
}
  $hours$::jsonb;

  -- 5. Appliquer le menu
  UPDATE public.site_content
    SET data = v_new_menu, updated_at = now()
    WHERE business_id = v_bid AND section_key = 'menu';
  GET DIAGNOSTICS v_menu_rows = ROW_COUNT;

  -- 6. Appliquer les horaires (dans infos, sans toucher au reste)
  UPDATE public.site_content
    SET data = jsonb_set(data, '{hours}', v_new_hours), updated_at = now()
    WHERE business_id = v_bid AND section_key = 'infos';
  GET DIAGNOSTICS v_infos_rows = ROW_COUNT;

  -- 7. Garde-fou : nombre de lignes
  IF v_menu_rows != 1 THEN
    RAISE EXCEPTION 'Menu update : % lignes modifiées (attendu 1)', v_menu_rows;
  END IF;
  IF v_infos_rows != 1 THEN
    RAISE EXCEPTION 'Infos update : % lignes modifiées (attendu 1)', v_infos_rows;
  END IF;

  -- 8. Garde-fou : specials inchangés
  SELECT data INTO v_specials_after
    FROM public.site_content
    WHERE business_id = v_bid AND section_key = 'specials';
  IF v_specials_before IS DISTINCT FROM v_specials_after THEN
    RAISE EXCEPTION 'ALERTE : les specials ont été modifiés par cette transaction !';
  END IF;

  -- 9. Garde-fou : annonce inchangée
  SELECT data->>'announcement' INTO v_announcement_after
    FROM public.site_content
    WHERE business_id = v_bid AND section_key = 'infos';
  IF v_announcement_before IS DISTINCT FROM v_announcement_after THEN
    RAISE EXCEPTION 'ALERTE : l''annonce a été modifiée par cette transaction !';
  END IF;

  RAISE NOTICE 'OK — menu (% ligne) et horaires (% ligne) mis à jour.', v_menu_rows, v_infos_rows;
END $guard$;

-- 10. SELECT de contrôle final
SELECT
  sc.section_key,
  CASE sc.section_key
    WHEN 'menu' THEN jsonb_array_length(sc.data->'categories')
  END AS nb_categories,
  CASE sc.section_key
    WHEN 'menu' THEN (
      SELECT sum(jsonb_array_length(c->'items'))::int
      FROM jsonb_array_elements(sc.data->'categories') c
    )
  END AS nb_items,
  CASE sc.section_key
    WHEN 'menu' THEN jsonb_array_length(sc.data->'supplements')
  END AS nb_supplements,
  sc.updated_at
FROM public.site_content sc
JOIN public.businesses b ON b.id = sc.business_id
WHERE b.slug = 'enzo-pizza'
ORDER BY sc.section_key;

COMMIT;
