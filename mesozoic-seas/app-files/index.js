/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

(function() {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var data = window.APP_DATA;
  console.log(data);
  var viewIdx = 0;

  // Grab elements from DOM.
  var panoElement = document.querySelector('#pano');

  const generateNavbar = () =>{
    var bottomBar = document.createElement('div');
    bottomBar.classList.add('bottom-bar');
    var bottomBarLayout = document.createElement('div');
    bottomBarLayout.classList.add('bottom-bar-layout');
  
    var left = document.createElement('div');
    left.classList.add('page-button');
    var right = document.createElement('div');
    right.classList.add('page-button');
    left.addEventListener('click', ()=>{
      viewIdx+=1;
      switchScene(scenes[viewIdx]);
    })
    right.addEventListener('click', ()=>{
      viewIdx-=1;
      switchScene(scenes[viewIdx]);
    })
    bottomBarLayout.appendChild(right)
    bottomBarLayout.appendChild(left);
    bottomBar.appendChild(bottomBarLayout);
    document.body.appendChild(bottomBar);  
  }
  generateNavbar();
  // Detect desktop or mobile mode.
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode,
    }
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    // Create info hotspots.
    data.infoHotspots.forEach(function(hotspot) {
      console.log(hotspot);
      var element = createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    return {
      data: data,
      scene: scene,
      view: view
    };
  });





  function switchScene(scene) {
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
  }




  function createLinkHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    var icon = document.createElement('img');
    icon.src = 'img/link.png';
    icon.classList.add('link-hotspot-icon');

    // Set rotation transform.
    var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }



    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create image element.
    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = 'img/magnifiyingGlass.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    wrapper.appendChild(iconWrapper);



    var modalContent = document.createElement('div');
    modalContent.classList.add('info-hotspot-modal-content');

    // create modal content
    var modalTitle = document.createElement('h1');
    modalTitle.innerHTML = hotspot.title;
    var modalBody = document.createElement('p');
    modalBody.innerHTML = hotspot.text;
    console.log(hotspot.fossil);
    if (hotspot.fossil){
      console.log(hotspot.fossil);
      var citationWrapper = document.createElement('div');
      var fossil = document.createElement('img');
      fossil.src = hotspot.fossil.url;
      var citation = document.createElement('p');
      citation.innerHTML = hotspot.fossil.citation;
      var link = document.createElement('a');
      link.innerHTML= hotspot.fossil.citationUrl;

      citationWrapper.appendChild(fossil);
      citationWrapper.appendChild(citation);
      citationWrapper.appendChild(link);

      modalContent.appendChild(citationWrapper);
    }
    // Create a modal for the hotspot content to appear on mobile mode.
    var modal = document.createElement('div');
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);

    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
      modal.classList.toggle('visible');
    };

    // Show content when hotspot is clicked.
    wrapper.addEventListener('click', toggle);
    modal.addEventListener('click', ()=>{
      modal.classList.toggle('visible');
    })
    // Hide content when close icon is clicked.
    //modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);


    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }


  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
                      'wheel', 'mousewheel' ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }


  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  // Display the initial scene.
  switchScene(scenes[viewIdx]);

})();
