const GAME_NAME = "LatQfN2";
const GAME_VERSION = "1.0.0.0";

const CACHE_NAME = JSON.stringify({"name": GAME_NAME, "version": GAME_VERSION});
const CACHE_FILES = ["runner.data",
"runner.js",
"runner.wasm",
"audio-worklet.js",
"data_music_action.ogg",
"data_music_alfur.ogg",
"data_music_athletic.ogg",
"data_music_athletic2.ogg",
"data_music_bonus.ogg",
"data_music_boss.ogg",
"data_music_boss2.ogg",
"data_music_build.ogg",
"data_music_chill.ogg",
"data_music_credits.ogg",
"data_music_daffy.ogg",
"data_music_daffy2.ogg",
"data_music_dead.ogg",
"data_music_dead2.ogg",
"data_music_desert1.ogg",
"data_music_desert2.ogg",
"data_music_desert3.ogg",
"data_music_diary.ogg",
"data_music_finalboss.ogg",
"data_music_fish.ogg",
"data_music_forever1.ogg",
"data_music_forever2.ogg",
"data_music_forever3.ogg",
"data_music_forever_clear.ogg",
"data_music_gameoverbuzz.ogg",
"data_music_gilligan.ogg",
"data_music_granddad_streamed.ogg",
"data_music_jerry.ogg",
"data_music_levelclear.ogg",
"data_music_lnm.ogg",
"data_music_map.ogg",
"data_music_martini_streamed.ogg",
"data_music_menu.ogg",
"data_music_menu_special.ogg",
"data_music_minigolf.ogg",
"data_music_nothingland.ogg",
"data_music_nswitch.ogg",
"data_music_old.ogg",
"data_music_old2.ogg",
"data_music_old3.ogg",
"data_music_old4.ogg",
"data_music_overworld1.ogg",
"data_music_overworld2.ogg",
"data_music_password.ogg",
"data_music_preboss.ogg",
"data_music_pswitch.ogg",
"data_music_robotnik.ogg",
"data_music_secretdesk_streamed.ogg",
"data_music_smurf.ogg",
"data_music_spamvid3.ogg",
"data_music_starman0.ogg",
"data_music_starman1.ogg",
"data_music_starman2.ogg",
"data_music_starman3.ogg",
"data_music_starman4.ogg",
"data_music_starman5.ogg",
"data_music_starman6.ogg",
"data_music_starman7.ogg",
"data_music_starman8.ogg",
"data_music_stuart.ogg",
"data_music_tetris_streamed.ogg",
"data_music_thankful.ogg",
"data_music_trophies.ogg",
"data_music_tutorial.ogg",
"data_music_underground1.ogg",
"data_music_underground2_streamed.ogg",
"data_music_underground3.ogg",
"data_music_unowenwasher.ogg",
"data_music_water_streamed.ogg",
"data_music_webdriver.ogg",
"game.unx"
];

self.addEventListener("fetch", (event) => {
  const should_cache = CACHE_FILES.some((f) => {
      return event.request.url.endsWith(f);
  });
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (should_cache) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.allSettled(
      keys.map((key) => {
        try {
          const data = JSON.parse(key);
          if (data && data["name"] && data.name == GAME_NAME &&
              data.version && data.version != GAME_VERSION) {
            return caches.delete(key);
          }
        } catch {
          return;
        }
      })
    )).then(() => {
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
