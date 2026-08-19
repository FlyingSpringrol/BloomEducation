(function () {
  'use strict';
  var data = window.EGYPT_EXPLORER;
  var configs = {};
  data.scenes.forEach(function (scene) { configs[scene.id] = { type: 'equirectangular', panorama: scene.file, pitch: 0, yaw: 0, hfov: 90, hotSpots: [] }; });
  var viewerElement = document.getElementById('viewer');
  var viewer = pannellum.viewer(viewerElement, { default: { firstScene: data.scenes[0].id, autoLoad: true, sceneFadeDuration: 220, showControls: false, mouseZoom: false, keyboardZoom: false, disableKeyboardCtrl: true, friction: .28, minHfov: 42, maxHfov: 110 }, scenes: configs });
  var modal = document.getElementById('story-modal');
  var strip = document.getElementById('scene-strip');
  var activeIndex = 0, switching = false, wheelTotal = 0, wheelTimer, clickOrigin;

  function createHotspot(wrapper, args) {
    wrapper.classList.add('story-hotspot-shell');
    var button = document.createElement('button');
    button.className = 'story-hotspot'; button.type = 'button';
    button.setAttribute('aria-label', 'Open story: ' + args.title);
    button.innerHTML = '<span>+</span><b>' + args.title + '</b>';
    button.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); openStory(args.key); });
    wrapper.appendChild(button);
  }
  Object.keys(data.stories).forEach(function (key, index) {
    var story = data.stories[key];
    viewer.addHotSpot({ id: 'story-' + index, yaw: story.yaw, pitch: story.pitch, cssClass: 'story-hotspot-shell', createTooltipFunc: createHotspot, createTooltipArgs: { key: key, title: story.title } }, story.scene);
  });
  function openStory(key) {
    var story = data.stories[key]; if (!story) return;
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-kicker').textContent = story.kicker;
    document.getElementById('story-body').textContent = story.body;
    var image = document.getElementById('story-image'); image.src = story.image; image.alt = story.title;
    modal.hidden = false; document.body.classList.add('modal-open'); modal.querySelector('.story-close').focus();
  }
  function closeStory() { if (modal.hidden) return; modal.hidden = true; document.body.classList.remove('modal-open'); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (button) { button.addEventListener('click', closeStory); });
  viewerElement.addEventListener('pointerdown', function (event) { clickOrigin = { x: event.clientX, y: event.clientY }; }, true);
  viewerElement.addEventListener('click', function (event) {
    if (event.target.closest('.story-hotspot') || !clickOrigin) return;
    var distance = Math.hypot(event.clientX - clickOrigin.x, event.clientY - clickOrigin.y); clickOrigin = null; if (distance > 7) return;
    var hotspot = document.elementsFromPoint(event.clientX, event.clientY).find(function (el) { return el.classList && el.classList.contains('story-hotspot'); }); if (hotspot) hotspot.click();
  }, true);
  data.scenes.forEach(function (scene, index) {
    var button = document.createElement('button'); button.className = 'scene-thumb'; button.type = 'button'; button.setAttribute('aria-label', 'Open scene ' + (index + 1));
    button.innerHTML = '<img src="' + scene.file + '" alt="" loading="lazy" decoding="async"><span>' + String(index + 1).padStart(2, '0') + '</span>';
    button.addEventListener('click', function () { switchScene(index); }); strip.appendChild(button);
  });
  var thumbs = Array.prototype.slice.call(strip.children);
  function updateCopy() { var scene = data.scenes[activeIndex]; document.getElementById('scene-title').textContent = scene.title; document.getElementById('scene-description').textContent = scene.description; document.getElementById('scene-count').textContent = (activeIndex + 1) + ' of ' + data.scenes.length; document.getElementById('support-link').hidden = activeIndex !== data.scenes.length - 1; }
  function switchScene(index) {
    var next = Math.max(0, Math.min(data.scenes.length - 1, index)); if (next === activeIndex && !switching) return;
    switching = true; closeStory(); activeIndex = next; document.body.classList.add('loading'); viewer.stopMovement(); viewer.loadScene(data.scenes[next].id, 0, 0, 90); updateCopy();
    thumbs.forEach(function (thumb, i) { thumb.classList.toggle('active', i === activeIndex); thumb.setAttribute('aria-current', i === activeIndex ? 'true' : 'false'); });
    thumbs[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); document.getElementById('hint').classList.add('hidden');
  }
  function step(amount) { switchScene(activeIndex + amount); }
  document.getElementById('previous').addEventListener('click', function () { step(-1); }); document.getElementById('next').addEventListener('click', function () { step(1); });
  document.getElementById('scene-toggle').addEventListener('click', function () { var expanded = this.getAttribute('aria-expanded') === 'true'; this.setAttribute('aria-expanded', String(!expanded)); document.getElementById('scene-details').hidden = expanded; this.closest('.scene-card').classList.toggle('is-collapsed', expanded); });
  window.addEventListener('wheel', function (event) { if (!modal.hidden || (event.target.closest && event.target.closest('.scene-strip'))) return; event.preventDefault(); wheelTotal += event.deltaY; clearTimeout(wheelTimer); wheelTimer = setTimeout(function () { wheelTotal = 0; }, 180); if (Math.abs(wheelTotal) >= 60 && !switching) { step(wheelTotal > 0 ? 1 : -1); wheelTotal = 0; } }, { passive: false });
  window.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !modal.hidden) return closeStory(); if (!modal.hidden) return; if (['ArrowRight', 'ArrowDown', 'PageDown'].indexOf(event.key) >= 0) step(1); if (['ArrowLeft', 'ArrowUp', 'PageUp'].indexOf(event.key) >= 0) step(-1); });
  document.getElementById('zoom-in').addEventListener('click', function () { viewer.setHfov(viewer.getHfov() * .82); }); document.getElementById('zoom-out').addEventListener('click', function () { viewer.setHfov(viewer.getHfov() * 1.18); });
  document.getElementById('fullscreen').addEventListener('click', function () { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); });
  viewer.on('scenechangefadedone', function () { document.body.classList.remove('loading'); switching = false; }); viewer.on('error', function () { document.body.classList.remove('loading'); switching = false; });
  updateCopy(); thumbs[0].classList.add('active'); thumbs[0].setAttribute('aria-current', 'true'); setTimeout(function () { document.getElementById('hint').classList.add('hidden'); }, 6000);
}());
