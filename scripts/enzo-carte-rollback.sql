-- ============================================================
-- enzo-carte-rollback.sql — Restaure menu + horaires depuis le
-- backup du 2026-10-14 (avant mise à jour carte octobre).
-- Exécuter dans le SQL Editor de Supabase.
-- ============================================================

BEGIN;

DO $guard$
DECLARE
  v_bid uuid;
  v_menu_rows int;
  v_infos_rows int;
  v_old_menu jsonb;
  v_old_hours jsonb;
BEGIN
  SELECT id INTO v_bid FROM public.businesses WHERE slug = 'enzo-pizza';
  IF v_bid IS NULL THEN
    RAISE EXCEPTION 'Business enzo-pizza introuvable';
  END IF;

  -- Menu d'avant la mise à jour (backup 2026-10-14)
  v_old_menu := $menu$
{"categories":[{"id":"classiques","name":"Les classiques","items":[{"id":"focaccia-mini","name":"Focaccia Mini","tags":["veggie"],"price":3.9,"available":true,"priceNote":null,"description":"Pâte maison légère, huile d'olive, sel, et origan."},{"id":"margherita","name":"Margherita","tags":["veggie"],"price":11.9,"available":true,"priceNote":null,"description":"Sauce tomate, mozzarella fior di latte, basilic."},{"id":"veritable-margherita","name":"Véritable Margherita","tags":["veggie"],"price":14.9,"available":true,"priceNote":null,"description":"Sauce tomate, burrata, basilic."},{"id":"anchois","name":"Anchois","tags":[],"price":12.9,"available":true,"priceNote":null,"description":"Sauce tomate, ails confits, olives, anchois, huile d'olive, origan."},{"id":"romaine","name":"Romaine","tags":[],"price":12.5,"available":true,"priceNote":null,"description":"Sauce tomate, jambon blanc, mozzarella fior di latte."},{"id":"regina","name":"Regina","tags":[],"price":13.5,"available":true,"priceNote":null,"description":"Sauce tomate, jambon blanc, champignons frais, mozzarella fior di latte."},{"id":"quattro-formaggi","name":"Quattro Formaggi","tags":["veggie"],"price":14.9,"available":true,"priceNote":null,"description":"Sauce tomate ou crème, roquefort AOP, mozzarella fior di latte, emmental, Taleggio."},{"id":"salamech","name":"Salamech","tags":[],"price":12.9,"available":true,"priceNote":null,"description":"Sauce tomate, spianata ou merguez, mozzarella fior di latte."},{"id":"diavola","name":"Diavola","tags":["epice"],"price":16.9,"available":true,"priceNote":null,"description":"Crème de poivrons rouges, merguez ou spianata, oignons confits, mozzarella fior di latte, après cuisson crumble de tomate, miel épicé."},{"id":"provencale","name":"Provençale","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Sauce tomate, aubergines frites, oignons confits, ails confits, poivrons marinés, viandes hachées, mozzarella fior di latte, après cuisson romarin."},{"id":"parmigiana","name":"Parmigiana","tags":["veggie"],"price":14.9,"available":true,"priceNote":null,"description":"Sauce tomate, aubergines frites, crèmes de grana, mozzarella fior di latte, après cuisson copeaux de grana, basilic."},{"id":"tchatchouka","name":"Tchatchouka","tags":[],"price":13.9,"available":true,"priceNote":null,"description":"Sauce tomate, oignons confits, poivrons marinés, mozzarella fior di latte, après cuisson jaune d'œuf."},{"id":"verdura","name":"Verdura","tags":["veggie"],"price":15.5,"available":true,"priceNote":null,"description":"Sauce tomate, aubergines frites, poivrons marinés, artichauts romains, après cuisson copeaux de grana, pesto roquette."},{"id":"mama","name":"Mama","tags":[],"price":15.5,"available":true,"priceNote":null,"description":"Sauce tomate, guanciale, spianata, poivrons marinés après cuisson, basilic, jambon cru."},{"id":"donald","name":"Donald","tags":[],"price":15.9,"available":true,"priceNote":null,"description":"Sauce tomate, cheddar, viande hachée, mozzarella fior di latte, après cuisson cornichons, oignons frits."},{"id":"carbonara","name":"Carbonara","tags":[],"price":14.9,"available":true,"priceNote":null,"description":"Crème de grana, guanciale, mozzarella fior di latte, après cuisson pécorino, jaune d'œuf, grains de poivre."},{"id":"pollo","name":"Pollo","tags":[],"price":13.9,"available":true,"priceNote":null,"description":"Crème de curry, poulet, mozzarella fior di latte."},{"id":"doudou","name":"Doudou","tags":[],"price":15.9,"available":true,"priceNote":null,"description":"Crème de cajun, poulet, poivrons, mozzarella fior di latte, après cuisson noix de cajou, tomate séchée."},{"id":"amo","name":"Amo","tags":["coup-de-coeur"],"price":16.9,"available":true,"priceNote":null,"description":"Sauce tomate, artichaut romain, après cuisson jambon blanc supérieur, burrata, tomate séchée, roquette, pesto de roquette."},{"id":"italia","name":"Italia","tags":[],"price":16.5,"available":true,"priceNote":null,"description":"Sauce tomate après cuisson jambon cru, tomate séchée, pignons, roquette, copeaux de grana, basilic."},{"id":"marakchi","name":"Marakchi","tags":[],"price":15.9,"available":true,"priceNote":null,"description":"Crème, oignons confits, sauce blanche, kebab, mozzarella fior di latte."}],"tagline":"la carte toute l'année"},{"id":"blanches","name":"Les blanches","items":[{"id":"dodu","name":"Dodu","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Crème, Taleggio, mozzarella fior di latte, après cuisson sgrassatella (mélange coppa, pancetta), huile de cacahuète, éclats de cacahuètes."},{"id":"sorriso","name":"Sorriso","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Base crème, cabécou, mozzarella fior di latte, après cuisson sgrassatella (mélange coppa, pancetta), miel de romarin, romarin."},{"id":"miele","name":"Miele","tags":["veggie"],"price":14.9,"available":true,"priceNote":null,"description":"Crème, cabécou, mozzarella fior di latte, après cuisson miel."},{"id":"nemo","name":"Nemo","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Crème de persil, saumon fumé, mozzarella fior di latte, persil."}],"tagline":"sans sauce tomate"},{"id":"pates","name":"Pâtes fraîches","items":[{"id":"gnocchis-semplice","name":"Gnocchis Semplice","tags":["veggie"],"price":13.9,"available":true,"priceNote":null,"description":"Huile d'olive, ails confits, tomates séchées, copeaux de Grana."},{"id":"gnocchis-inspi-carbo","name":"Gnocchis Inspi Carbo","tags":[],"price":15.9,"available":true,"priceNote":null,"description":"Crème de parmesan, guanciale croustillant, copeaux de pécorino, jaune d'œuf, grains de poivre."},{"id":"gnocchis-pomodoro","name":"Gnocchis Pomodoro","tags":["veggie"],"price":15.9,"available":true,"priceNote":null,"description":"Sauce tomate, burrata, basilic, tomate séchée."},{"id":"gnocchis-dodu","name":"Gnocchis Dodu","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Crème de Taleggio, sgrassatella (mélange de pancetta coppa), huile de cacahuètes, éclats de cacahuètes."},{"id":"gnocchis-nemo","name":"Gnocchis Nemo","tags":[],"price":16.9,"available":true,"priceNote":null,"description":"Crème de persil, saumon fumé, persil."},{"id":"raviolis-frais","name":"Raviolis frais","tags":[],"price":null,"available":true,"priceNote":"Prix selon composition","description":"À découvrir sur l'ardoise ! Une recette selon les envies du chef."},{"id":"gnocchis-detail","name":"Gnocchis au détail","tags":[],"price":0.99,"available":true,"priceNote":"/ 100g","description":"Gnocchis frais crus, à emporter pour les cuisiner chez vous."}],"tagline":"faites maison, chaque jour"},{"id":"partager","name":"À partager","items":[{"id":"burrata-classique","name":"Burrata Classique — mini","tags":["veggie"],"price":8.9,"available":true,"priceNote":null,"description":"Roquette, burrata, basilic, tomate séchée."},{"id":"burrata-parmigiana","name":"Burrata Parmigiana — mini","tags":["veggie"],"price":9.9,"available":true,"priceNote":null,"description":"Aubergines frites, burrata, tomates séchées, basilic."},{"id":"salade-italienne","name":"Salade Italienne","tags":[],"price":14.9,"available":true,"priceNote":null,"description":"Roquette, burrata, légumes du moment, jambon cru, basilic."}],"tagline":"… ou pas"},{"id":"desserts","name":"Desserts","items":[{"id":"tiramisu","name":"Tiramisu","tags":["veggie"],"price":4.9,"available":true,"priceNote":null,"description":"Tiramisu du moment, recette maison."},{"id":"piccola-nutella","name":"Piccola Nutella","tags":["veggie"],"price":12.9,"available":true,"priceNote":null,"description":"Petite pizza au mascarpone, nutella, éclats de noisettes."},{"id":"zeppoline","name":"Zeppoline","tags":["veggie"],"price":9.9,"available":true,"priceNote":null,"description":"Beignets de pâte à pizza frits, sucre, avec topping au choix : nutella, noisette ou pistache."}],"tagline":"pour finir en douceur"}],"supplements":[{"id":"sup-burrata","name":"Burrata","price":5},{"id":"sup-legumes","name":"Légumes","price":1.9},{"id":"sup-fromage","name":"Fromage","price":2.9},{"id":"sup-charcuterie","name":"Charcuteries / viandes","price":3.9},{"id":"sup-oeuf","name":"Œuf","price":1.5},{"id":"sup-salade","name":"Salade","price":3.5}]}
  $menu$::jsonb;

  -- Horaires d'avant la mise à jour
  v_old_hours := $hours$
{
  "fri": {"slots": [{"open": "17:00", "close": "22:00"}], "closed": false},
  "mon": {"slots": [{"open": "17:00", "close": "21:30"}], "closed": false},
  "sat": {"slots": [{"open": "17:00", "close": "22:00"}], "closed": false},
  "sun": {"slots": [{"open": "17:00", "close": "22:00"}], "closed": false},
  "thu": {"slots": [{"open": "17:00", "close": "21:30"}], "closed": false},
  "tue": {"slots": [{"open": "17:00", "close": "22:00"}], "closed": false},
  "wed": {"slots": [{"open": "17:00", "close": "22:00"}], "closed": false}
}
  $hours$::jsonb;

  -- Restaurer le menu
  UPDATE public.site_content
    SET data = v_old_menu, updated_at = now()
    WHERE business_id = v_bid AND section_key = 'menu';
  GET DIAGNOSTICS v_menu_rows = ROW_COUNT;

  -- Restaurer les horaires
  UPDATE public.site_content
    SET data = jsonb_set(data, '{hours}', v_old_hours), updated_at = now()
    WHERE business_id = v_bid AND section_key = 'infos';
  GET DIAGNOSTICS v_infos_rows = ROW_COUNT;

  IF v_menu_rows != 1 THEN
    RAISE EXCEPTION 'Rollback menu : % lignes (attendu 1)', v_menu_rows;
  END IF;
  IF v_infos_rows != 1 THEN
    RAISE EXCEPTION 'Rollback infos : % lignes (attendu 1)', v_infos_rows;
  END IF;

  RAISE NOTICE 'ROLLBACK OK — menu et horaires restaurés.';
END $guard$;

-- Vérification
SELECT sc.section_key,
  CASE sc.section_key WHEN 'menu' THEN jsonb_array_length(sc.data->'categories') END AS nb_categories,
  CASE sc.section_key WHEN 'menu' THEN (
    SELECT sum(jsonb_array_length(c->'items'))::int
    FROM jsonb_array_elements(sc.data->'categories') c
  ) END AS nb_items,
  sc.updated_at
FROM public.site_content sc
JOIN public.businesses b ON b.id = sc.business_id
WHERE b.slug = 'enzo-pizza'
ORDER BY sc.section_key;

COMMIT;
