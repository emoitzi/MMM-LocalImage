Module.register("MMM-LocalImage",{
	// Default module config.
	defaults: {
    interval: 5
	},
  images: [],
  retry: 0,
	current_index: 0,

	visible: null,
	invisible: null,
	animation: 'transition',

	initialize: {
		'show': function(self) {
			self.invisible.hide();
		},
		'animate': function(self) {
			self.invisible.attr('style','opacity: 0');
		},
		'transition': function(self) {
			self.invisible.className += 'invisible';
			self.visible.className += 'visible';
		}
	},

	animations: {
		'show': function(self, callback) {
			self.invisible.show(400, function() {
				self.visible.hide(400);
				callback();
			});

		},
		'animate': function(self, callback) {
			self.invisible.animate({ opacity: 0.9}, 1000);
			self.visible.animate({ opacity: 0}, 1000);
			callback();

		},
		'transition': function(self, callback) {
			self.invisible.removeClass('invisible');
			self.invisible.addClass('visible');
			self.visible.removeClass('visible');
			self.visible.addClass('invisible');
			callback();
		}
	},


  start: function() {
    var dir = this.config.path;
    var self = this;
    var path = this.file('images');
    this.sendSocketNotification("SUBSCRIBE");
  },
  // Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "IMAGES" && payload) {
      Log.info('Images: ' + payload);
      this.images = payload;
      this.getImage();
    }
    else if  (this.retry < 1) {
      this.retry++;
      setTimeout(self.start, 3000);
    }
    else {
      Log.error('Received no images.');
    }
  },

  getImage: function() {
    var self = this;
    if (! this.images.length) {
			console.log('No images!');
      return '';
    }
		console.log('getImage()');

    var image = this.file(this.images[this.current_index++ % this.images.length]);
    $('<img/>').attr('src', image).on('load', function() {
      $(this).remove();
      self.invisible.attr('style', 'background-image: url("' + image + '")');
      self.animations[self.animation](self, () => {
        var temp = self.visible;
        self.visible = self.invisible;
        self.invisible = temp;
      });
    });

    setTimeout(function() {
			self.getImage();
    }, (self.config.interval * 1000));
  },

	// Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = '<div id="localimage1" class="localimage" ></div><div id="localimage2"class="localimage"></div>';
    wrapper.className += 'localimage-wrapper';
    this.invisible = $(wrapper).find('#localimage1');
    this.visible = $(wrapper).find('#localimage2');

    this.initialize[this.animation](this);

    return wrapper;
  },
  getScripts: function() {
    return [
			this.file('node_modules/jquery/dist/jquery.min.js')
    ]
  },
	getStyles: function() {
		return [
			'localimage.css'
		]
	}

});
