// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		activitiesIcons: []
	},

	mounted() {
		let vm = this;

		// Load activities list
		_loadActivities().then(function(activities) {
			// Load an convert to pure SVG each icon
			let len = activities.length;
			for (let i = 0 ; i < len ; i++) {
				let activity = activities[i];
				_loadAndConvertIcon("../../"+activity.directory+"/"+activity.icon).then(function(svg) {
					vm.activitiesIcons[activity.id] = svg;
					if (Object.keys(vm.activitiesIcons).length == len) {
						// Falabracman
						vm.$refs.falabracman.svg = vm.activitiesIcons["org.sugarlabs.Falabracman"];
						vm.$refs.falabracman.color = 96;

						// Paint
						vm.$refs.paint.svg = vm.activitiesIcons["org.olpcfrance.PaintActivity"];
						vm.$refs.paint.color = 128;
					}
				});
			}
		});
	},

	methods: {

	}
});

// Load activities
function _loadActivities() {
	return new Promise(function(resolve, reject) {
		axios.get('../../activities.json').then(function(response) {
			resolve(response.data);
		}).catch(function(error) {
			reject(error);
 		});
	});
}

// Need to create an unique id for each SVG
let idCount = 1;

// Load icon and convert it to a pure SVG (remove Sugar stuff)
function _loadAndConvertIcon(url) {
	return new Promise(function(resolve, reject) {
		axios.get(url).then(function(response) {
			// Remove ENTITY HEADER
			let read = response.data;
			var buf = read.replace(/<!DOCTYPE[\s\S.]*\]>/g,"");

			// Replace &fill_color; and &stroke_color;
			buf = buf.replace(/&stroke_color;/g,"var(--stroke-color)");
			buf = buf.replace(/&fill_color;/g,"var(--fill-color)");

			// Add symbol and /symbol
			buf = buf.replace(/(<svg[^>]*>)/g,'$1<symbol id="icon'+idCount+'">');
			buf = buf.replace(/(<\/svg>)/g,'</symbol><use xlink:href="#icon'+idCount+'" href="#icon'+idCount+'"/>$1');
			idCount++;

			resolve(buf);
		}).catch(function(error) {
			reject(error);
 		});
	});
}

// TODO: Set icon color
function _setIconColor(icon, color) {
	if (!icon) {
		return -1; // Error bad element
	}
	var element = null;
	for (var i = 0 ; i < icon.children.length && !element ; i++) {
		if (icon.children[i].tagName == "svg") {
			element = icon.children[i];
		}
	}
	if (element == null) {
		return -1; // Error no SVG included
	}
	element.setAttribute("class", "xo-color"+color);
	return 0;
}
