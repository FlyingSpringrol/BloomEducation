(function () {
  'use strict';

  var sceneData = [
    { file: 'scene1.jpg', width: 3840, title: 'Into Deep Time', description: 'Welcome aboard our low-poly time machine. We’re traveling more than half a billion years into the past, to a world almost completely unlike our own.' },
    { file: 'scene3.jpg', width: 3840, title: 'The Cambrian Seas', description: 'Welcome to the Cambrian. Shallow seas stretch across much of the planet, and beneath the surface, animal life is exploding into strange new forms. Let’s dive in.' },
    { file: 'scene4.jpg', width: 3840, title: 'Life on the Seafloor', description: 'Tiny Marrella drift and scuttle just above the seabed, weaving between sponges and other unfamiliar creatures. Almost everything here looks like an evolutionary experiment.' },
    { file: 'scene5.jpg', width: 4096, title: 'The Strangest Animals', description: 'Nearby, Opabinia glides through the water with five eyes and a long grasping proboscis, while the spiny Hallucigenia creeps slowly across a sponge. The Cambrian is full of body plans unlike anything alive today.' },
    { file: 'scene6.jpg', width: 3840, title: 'The Ordovician Ocean', description: 'Now we jump forward roughly 20 million years into the Ordovician. Marine ecosystems have become richer and more complex, and straight-shelled nautiloids cruise through the open water.' },
    { file: 'scene7.jpg', width: 3840, title: 'A Crowded Ancient Sea', description: 'Bryozoan colonies cover the seafloor while trilobites, cephalopods, and other invertebrates move through the water around them. These oceans are becoming some of the most diverse ecosystems Earth has yet seen.' },
    { file: 'scene8.jpg', width: 3840, title: 'Into the Silurian', description: 'Another 40 million years forward brings us to the Silurian. The oceans are still thriving, but the world is changing—and life is beginning to explore entirely new environments.' },
    { file: 'scene9.jpg', width: 3960, title: 'Predators of the Silurian', description: 'The Silurian oceans are home to a new mix of hunters. Early bony fishes swim through the water, while eurypterids—formidable sea scorpions—patrol the shallows in search of prey.' },
    { file: 'scene10.jpg', width: 3840, title: 'Until Next Time', description: 'And that’s where our journey ends for now. We’ve crossed more than 100 million years of evolution—but Earth’s story is only getting started.' }
  ];

  var scenes = sceneData.map(function (item) {
    return { id: item.file.replace('.jpg', ''), item: item };
  });
  var pannellumScenes = {};
  scenes.forEach(function (entry) {
    pannellumScenes[entry.id] = {
      type: 'equirectangular', panorama: entry.item.file,
      pitch: 0, yaw: 0, hfov: 90, hotSpots: []
    };
  });
  var viewerElement = document.getElementById('viewer');
  var viewer = pannellum.viewer(viewerElement, {
    default: {
      firstScene: scenes[0].id,
      autoLoad: true,
      sceneFadeDuration: 220,
      showControls: false,
      mouseZoom: false,
      keyboardZoom: false,
      disableKeyboardCtrl: true,
      friction: 0.28,
      minHfov: 42,
      maxHfov: 110
    },
    scenes: pannellumScenes
  });

  var strip = document.getElementById('scene-strip');
  var title = document.getElementById('scene-title');
  var description = document.getElementById('scene-description');
  var count = document.getElementById('scene-count');
  var sceneToggle = document.getElementById('scene-toggle');
  var sceneDetails = document.getElementById('scene-details');
  var hint = document.getElementById('hint');
  var activeIndex = 0;
  var wheelTotal = 0;
  var wheelTimer;
  var switching = false;
  var clickOrigin = null;
  var modal = document.getElementById('organism-modal');
  var organismData = window.PALEOZOIC_ORGANISMS || {};
  var eras = ['cambrian', 'ordovician', 'silurian', 'devonian', 'carboniferous', 'permian', 'triassic'];

  // Pannellum's native drag surface is intentionally above custom hotspots.
  // Let it keep its optimized dragging, then forward stationary clicks to the
  // hotspot at the same screen coordinate.
  viewerElement.addEventListener('pointerdown', function (event) {
    clickOrigin = { x: event.clientX, y: event.clientY };
  }, true);
  viewerElement.addEventListener('click', function (event) {
    if (event.target.closest('.organism-hotspot') || !clickOrigin) return;
    var distance = Math.hypot(event.clientX - clickOrigin.x, event.clientY - clickOrigin.y);
    clickOrigin = null;
    if (distance > 7) return;
    var hotspot = document.elementsFromPoint(event.clientX, event.clientY).find(function (element) {
      return element.classList && element.classList.contains('organism-hotspot');
    });
    if (hotspot) hotspot.click();
  }, true);

  function setText(id, value) { document.getElementById(id).textContent = value || ''; }

  function fact(icon, label, value) {
    var row = document.createElement('div');
    row.innerHTML = '<dt><i aria-hidden="true">' + icon + '</i>' + label + '</dt><dd></dd>';
    row.querySelector('dd').textContent = value;
    return row;
  }

  function openOrganism(key) {
    var data = organismData[key];
    if (!data) return;
    setText('organism-name', data.name);
    setText('organism-scientific', data.scientific);
    setText('organism-description', data.description);
    setText('organism-period', data.period);
    setText('organism-age', data.age);
    setText('organism-found', data.found);
    setText('organism-kind', data.nutrition ? 'PLANT / ORGANISM' : 'ANIMAL');
    var image = document.getElementById('organism-image');
    var visual = image.closest('.organism-visual');
    visual.classList.remove('is-ready');
    visual.classList.add('is-loading');
    image.alt = data.name + ' reconstruction';
    image.hidden = true;
    image.removeAttribute('src');
    var imageRequest = String((Number(image.dataset.request) || 0) + 1);
    image.dataset.request = imageRequest;
    var imageLoader = new Image();
    imageLoader.onload = function () { if (image.dataset.request === imageRequest) { image.src = data.image; image.hidden = false; requestAnimationFrame(function () { visual.classList.remove('is-loading'); visual.classList.add('is-ready'); }); } };
    imageLoader.onerror = function () { if (image.dataset.request === imageRequest) visual.classList.remove('is-loading'); };
    imageLoader.src = data.image;

    var group = document.getElementById('organism-group');
    group.replaceChildren();
    data.group.forEach(function (value, index) {
      if (index) group.appendChild(document.createElement('span'));
      var item = document.createElement('b');
      item.textContent = (index ? '◒  ' : '♧  ') + value;
      group.appendChild(item);
    });

    var facts = document.getElementById('organism-facts');
    facts.replaceChildren(
      fact('⌖', 'SIZE', data.size), fact('◌', 'DEPTH', data.depth),
      fact('◒', data.nutrition ? 'NUTRITION' : 'DIET', data.diet),
      fact('⌬', data.nutrition ? 'NUTRITION TYPE' : 'DIET TYPE', data.dietType),
      fact('≋', 'HABITAT', data.habitat), fact('◷', 'BEHAVIOR', data.behavior)
    );

    var tags = document.getElementById('organism-tags');
    tags.replaceChildren();
    data.tags.forEach(function (value) {
      var tag = document.createElement('span');
      tag.textContent = value;
      tags.appendChild(tag);
    });

    var track = document.getElementById('era-track');
    track.replaceChildren();
    eras.forEach(function (era) {
      var segment = document.createElement('span');
      segment.textContent = era.toUpperCase();
      segment.classList.toggle('active', era === data.era);
      track.appendChild(segment);
    });
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.organism-close').focus();
  }

  function closeOrganism() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (button) {
    button.addEventListener('click', closeOrganism);
  });

  function createOrganismHotspot(wrapper, args) {
    wrapper.classList.add('organism-hotspot-shell');
    var hotspot = document.createElement('button');
    hotspot.className = 'organism-hotspot';
    hotspot.type = 'button';
    hotspot.setAttribute('aria-label', 'Open details for ' + args.name);
    hotspot.innerHTML = '<span>+</span><b>' + args.name + '</b>';
    hotspot.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openOrganism(args.key);
    });
    wrapper.appendChild(hotspot);
  }

  (window.PALEOZOIC_ANNOTATIONS || []).forEach(function (annotation, index) {
    var data = organismData[annotation[3]];
    if (!data || !pannellumScenes[annotation[0]]) return;
    viewer.addHotSpot({
      id: 'organism-' + index,
      yaw: annotation[1] * 180 / Math.PI,
      pitch: -annotation[2] * 180 / Math.PI,
      cssClass: 'organism-hotspot-shell',
      createTooltipFunc: createOrganismHotspot,
      createTooltipArgs: { key: annotation[3], name: data.name }
    }, annotation[0]);
  });

  sceneData.forEach(function (item, index) {
    var button = document.createElement('button');
    button.className = 'scene-thumb';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open scene ' + (index + 1));
    button.innerHTML = '<img src="thumbs/' + item.file + '" alt="" loading="lazy" decoding="async"><span>' + String(index + 1).padStart(2, '0') + '</span>';
    button.addEventListener('click', function () { switchScene(index); });
    strip.appendChild(button);
  });

  var thumbs = Array.prototype.slice.call(strip.children);

  function switchScene(index) {
    var nextIndex = Math.max(0, Math.min(scenes.length - 1, index));
    if (nextIndex === activeIndex && !switching) return;
    switching = true;
    closeOrganism();
    activeIndex = nextIndex;
    document.body.classList.add('loading');
    viewer.stopMovement();
    viewer.loadScene(scenes[activeIndex].id, 0, 0, 90);
    title.textContent = sceneData[activeIndex].title;
    description.textContent = sceneData[activeIndex].description;
    count.textContent = (activeIndex + 1) + ' of ' + scenes.length;
    document.getElementById('support-link').hidden = activeIndex !== scenes.length - 1;
    sceneToggle.setAttribute('aria-expanded', 'true');
    sceneDetails.hidden = false;
    sceneToggle.closest('.scene-card').classList.remove('is-collapsed');
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === activeIndex);
      thumb.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });
    thumbs[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    hint.classList.add('hidden');
  }

  function step(amount) { switchScene(activeIndex + amount); }
  document.getElementById('previous').addEventListener('click', function () { step(-1); });
  document.getElementById('next').addEventListener('click', function () { step(1); });

  sceneToggle.addEventListener('click', function () {
    var expanded = sceneToggle.getAttribute('aria-expanded') === 'true';
    sceneToggle.setAttribute('aria-expanded', String(!expanded));
    sceneDetails.hidden = expanded;
    sceneToggle.closest('.scene-card').classList.toggle('is-collapsed', expanded);
  });

  window.addEventListener('wheel', function (event) {
    if (!modal.hidden) return;
    if (event.target.closest && event.target.closest('.scene-strip')) return;
    event.preventDefault();
    wheelTotal += event.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { wheelTotal = 0; }, 180);
    if (Math.abs(wheelTotal) >= 60 && !switching) {
      step(wheelTotal > 0 ? 1 : -1);
      wheelTotal = 0;
    }
  }, { passive: false });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) { closeOrganism(); return; }
    if (!modal.hidden) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') step(1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') step(-1);
  });

  function zoom(factor) {
    viewer.setHfov(viewer.getHfov() * factor);
  }
  document.getElementById('zoom-in').addEventListener('click', function () { zoom(0.82); });
  document.getElementById('zoom-out').addEventListener('click', function () { zoom(1.18); });

  document.getElementById('fullscreen').addEventListener('click', function () {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  viewer.on('scenechangefadedone', function () {
    document.body.classList.remove('loading');
    switching = false;
  });
  viewer.on('error', function () {
    document.body.classList.remove('loading');
    switching = false;
  });
  thumbs[0].classList.add('active');
  thumbs[0].setAttribute('aria-current', 'true');
  setTimeout(function () { hint.classList.add('hidden'); }, 6000);
}());
