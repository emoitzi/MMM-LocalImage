fs = require('fs');


var NodeHelper = require("node_helper");
module.exports = NodeHelper.create({
  images: [],
  subfolder: '/public',
  fullpath: null,
  refresh: 60 * 5,

  socketNotificationReceived: function(notification, payload) {
		if (notification === "SUBSCRIBE") {
      this.sendSocketNotification("IMAGES", this.images);
      this.updateImages();
			return;
		}
  },
  equal: function(a1, a2) {
    // from https://stackoverflow.com/a/19746771
    return a1.length==a2.length && a1.every(function(v,i) { return v === a2[i]});
  },
  _getAllFilesFromFolder: function(dir, callback) {
    var self = this;
    var full_dir = this.path + '/' + dir;
    fs.readdir(full_dir, function(err, files) {
      var images = [];
      if (err) {
        console.log(err);
      }
      files.forEach(function(file) {
        var stat_file = full_dir +'/'+file;
        var stat = fs.statSync(stat_file, fs.constants.R_OK);
        if (stat && stat.isFile()) {
          images.push(dir + '/' +  file);
        }
      });
      callback(images);
    });
  },
  updateImages: function() {
    var self = this;
    setTimeout( () => {
      self._getAllFilesFromFolder('public', function(images) {
        if (! self.equal(self.images, images)) {
          self.images =  images;
          self.sendSocketNotification("IMAGES", self.images);
        }
        self.updateImages();
      });

    }, self.refresh * 1000);

  },

  start: function() {
    var self = this;
    console.log('starting LocalImage helper');
    this.fullpath = this.path + '/' + this.subfolder;
    this._getAllFilesFromFolder('public', function (images) {
      self.images = images;
    });
  },


});
