var resizeTimer;

function openNav() {
  document.getElementById("sidebar-menu").style.width = "50%";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("sidebar-menu").style.width = "0";
}

function serialize(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function httpPostAsync(url, data, callback)
{
  var http = new XMLHttpRequest();
  var params = serialize(data);
  http.open("POST", url, true);

  //Send the proper header information along with the request
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        callback(http.responseText);
    }
  }
  http.send(params);
}

document.addEventListener("DOMContentLoaded", function(event) {
  /* Setup click functions for sub menu items */
  var subMenuHandles = document.querySelectorAll('.has-sub-menu')
  for (var i = 0; i < subMenuHandles.length; i++) {
    subMenuHandles[i].addEventListener('click', function(event) {
      event.preventDefault();
      console.log('Menu item with sub menu');
      var subMenu = event.target.nextElementSibling;
      var selected = event.target;
      var subMenuMarker = selected.querySelector('.sub-menu-marker');
      subMenu.classList.toggle('active');
      if (subMenuMarker) {
        selected.classList.toggle('active');
      }
    });
  }

  /* Initialise BaguetteBox for galleries */
  var baguetteOptions = {
    animation: 'slideIn',
    noScrollbars: true
  }
  var galleries = document.querySelectorAll('.gallery');
  if (galleries.length > 0) {

    baguetteBox.run('.gallery', baguetteOptions);

  }
  /* Initialise Carousel (only one on a page atm) */
  var carousel = (function() {
    if (!document.querySelector || !('classList' in document.body)) {
      return false;
    }
    var box = document.querySelector('.carouselbox') || document.getElementsByClassName('.carouselbox');
    if (!box || box.length < 1) {
      return;
    }
    var buttons = document.querySelector('.carousel-buttons');
    var next = document.querySelector('.next');
    var prev = document.querySelector('.prev');
    var items = box.querySelectorAll('.content li');
    var counter = 0;
    var amount = items.length;
    var current = items[0];
    box.classList.add('active');
    buttons.classList.add('active');
    var hammer = new Hammer(box, {});

    function navigate(direction) {
      var temp_counter = counter + direction;
      if (direction === -1 &&
        temp_counter < 0) {
        // reached the end
        // counter = amount - 1;
        return;
      }
      if (direction === 1 &&
        !items[temp_counter]) {
        //back at the start
        // counter = 0;
        return;
      }
      current.classList.remove('current');
      counter = temp_counter;

      current = items[counter];
      current.classList.add('current');
      box.style.height = current.offsetHeight + 'px';

      // check if next should be disabled
      if (!items[counter + 1]) {
        next.classList.add('disabled');
        next.disabled = true;
      } else {
        next.classList.remove('disabled');
        next.disabled = false;
      }
      // check if prev needs to be disabled
      if (counter - 1 < 0) {
        prev.classList.add('disabled');
        prev.disabled = true;
      } else {
        prev.classList.remove('disabled');
        prev.disabled = false;
      }
    }
    next.addEventListener('click', function(ev) {
      navigate(1);
    });
    prev.addEventListener('click', function(ev) {
      navigate(-1);
    });
    hammer.on('swipeleft', function() {
      navigate(1)
    });
    hammer.on('swiperight', function() {
      navigate(-1)
    });
    // resize when image is loaded
    var src = items[0].querySelector('img').src;
    var img = new Image();
    img.onload = function() {
      box.style.height = current.offsetHeight + 'px';
    };
    img.src = src;

    // change size of current when screen rotates
    window.addEventListener("orientationchange", function() {
      // resize visible area when device is rotated
      box.style.height = current.offsetHeight + 'px';
    });
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        box.style.height = current.offsetHeight + 'px';
      }, 250);
    });
    navigate(0);
  })();

  // submit contact form
  if (document.querySelector('#contact-form')) {
    var contact_form = document.querySelector('#contact-form');

    contact_form.addEventListener('submit', function(e) {
      e.preventDefault();
      var formData = {
        name: document.querySelector('#name').value,
        email: document.querySelector('#email').value,
        phone: document.querySelector('#phone').value,
        suburb: document.querySelector('#suburb').value,
        message: document.querySelector('#message').value,
        sendTo: document.querySelector('#send-to').value,
        subject: document.querySelector('#subject').value
      }
      httpPostAsync('http://christalclearpools.com.au/submitForm.php', formData, function(res) {
        console.log(res);
      });
    });
  }
});
