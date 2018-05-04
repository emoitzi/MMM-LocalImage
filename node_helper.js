fs = require('fs');


var NodeHelper = require("node_helper");
module.exports = NodeHelper.create({
  images: [],
  subfolder: '/public',
  fullpath: null,
  refresh: 60,

  socketNotificationReceived: function(notification, payload) {
		if (notification === "SUBSCRIBE") {
      this.getImages();
			return;
		}
  },
  _getAllFilesFromFolder: function(dir, callback) {
    var self = this;
    var full_dir = this.path + '/' + dir;
      fs.readdir(full_dir, function(err, files) {
        var results = [];
        if (err) {
          console.log(err);
        }
        files.forEach(function(file) {
          var stat_file = full_dir +'/'+file;
          var stat = fs.statSync(stat_file, fs.constants.R_OK);
          if (stat && stat.isFile()) {
            results.push(dir + '/' +  file);
          }
      });
      callback(results);
    });
  },
  getImages: function() {
  	this.sendSocketNotification("IMAGES", this.images);
    setTimeout( () => {
      self._getAllFilesFromFolder(dir, function(files) {
        self.images =  images;
        self.getImages();
      });

    }, self.refresh * 1000);

  },

  start: function() {
    var self = this;
    console.log('starting LocalImage helper');
    this.fullpath = this.path + '/' + this.subfolder;
    this._getAllFilesFromFolder('public', function (files) {
      self.images = files;
    });
  },


});
