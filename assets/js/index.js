function initMap() {
	var myposition = {lat: 45.4538236, lng: 8.5807615};
	var map = new google.maps.Map(document.getElementById('footerdiv'), {
		zoom: 8,
		center: myposition
	});
	var marker = new google.maps.Marker({
		position: myposition,
		map: map
	});
}