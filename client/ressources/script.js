hashCode = function(s) {
  var h = 0, l = s.length, i = 0;
  if ( l > 0 )
    while (i < l)
      h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return h;
};

async function get_terminus(id,ligne,direction) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			var a = ''
			tab.forEach( info => {
				a += `
						<div class="col-sm-6">
							<h3>
								<div class="panel panel-default">
									<div class="panel-body"><div class="panel-body">${info.trip_headsign}</div></div>
								</div>
							</h3>
						</div>
					`
			})
			document.getElementById(id).innerHTML= a
		}
	};
	xhttp.open("POST", `/terminus?direction=${direction}&ligne=${ligne}`, true);
	xhttp.send();
}
function liste_de_favoris(){
	document.getElementById("liste_ligne").innerHTML = ''
	for (const [key, value] of Object.entries(localStorage)) {
  		console.log(`${key}: ${value}`);
		var item = JSON.parse(value)
		var terminus = ''

		document.getElementById("liste_ligne").innerHTML  += 	`
							<div class="col-sm-12"><a href="${item.url}">
								<div class="panel panel-default text-center">
									<div class="panel-heading" style="background-color:#DB1F20;">
										<div class="row">
											<div class="col-sm-6"><h3>${item.ligne}</h3></div>
										</div><div class="row">
											<div class="col-sm-6"><h3>${item.arret}</h3></div>
										</div>
									</div>
									<div class="panel-body">
										<div class="col-sm-6"><h3 id="${key}">{terminus}</h3></div>
									</div>
								</div>
								</a>
							</div>
						`
		get_terminus(key,item.ligne,item.direction)
	};

}


function toggle_fav(){
	const urlParams = new URLSearchParams(window.location.search);
	const direction = urlParams.get('direction');
	const ligne = urlParams.get('ligne')
	const arret = urlParams.get('arret')

	var hash = hashCode(window.location.search)
	var item = localStorage.getItem(hash);
	if (item === null){
		localStorage.setItem(hash, JSON.stringify({"url":"/horraire"+window.location.search,"direction":direction,"ligne":ligne,"arret":arret} ));
		document.getElementById('favoris').innerHTML='<span class="glyphicon glyphicon-star"></span>'
	}
	else {
		localStorage.removeItem(hash);
		document.getElementById('favoris').innerHTML='<span class="glyphicon glyphicon-star-empty"></span>'
	}
}

function recherche_arret_id_nom(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {

				var panel_body = ''
				info.lignes.split(",").forEach(element => {
					panel_body += `<div class="col-sm-4"><h3><a href="/recherche_direction?ligne=${element}&arret=${info.stop_name}">${element}</a></h3></div>`
				});
				document.getElementById("liste_ligne").innerHTML +=
				`
					<div class="col-sm-12">
						<div class="panel panel-default text-center">
							<div class="panel-heading" style="background-color:#DB1F20;">
								<div class="row">
									<div class="col-sm-12"><h3>${info.stop_name}</h3></div>
								</div>
							</div>
							<div class="panel-body">
								${panel_body}
							</div>
						</div>
					</div>
				`
			})
		}
	};
	xhttp.open("POST", `/recherche_arret_par_ligne_arret?champ=${document.getElementById('champ').value}`, true);
	xhttp.send();

}

function recherche_ligne_par_ligne_direction(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {
				var panel_body = ''
				info.trip_headsigns.split('|').forEach(element => {
					var element = JSON.parse(element)
					var panel_body_body = ''
					element[1].split(',').forEach( headsign => {
						panel_body_body += `<div class="panel-body"><div class="panel-body">${headsign}</div></div>`
					});
					panel_body += `<div class="col-sm-6">
										<h3><a href="/recherche_arret?ligne=${info.route_short_name}&direction=${element[0]}">
												<div class="panel panel-default">
													${panel_body_body}
												</div>
											</a>
										</h3>
									</div>`
				});
				document.getElementById("liste_ligne").innerHTML +=
				`
				<div class="col-sm-12">
					<div class="panel panel-default text-center">
						<div class="panel-heading" style="background-color:#${info.route_color};">
							<div class="row">
								<div class="col-sm-4"><h3>${info.route_short_name}</h3></div>
								<div class="col-sm-8"><h3>${info.route_long_name}</h3></div>
							</div>
						</div>
						<div class="panel-body">
							${panel_body}
						</div>
					</div>
				</div>
				`
			})
		}
	};
	xhttp.open("POST", `/recherche_ligne_par_ligne_direction?champ=${document.getElementById('champ').value}`, true);
	xhttp.send();

}

function tout_les_arrets(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {

				var panel_body = ''
				info.lignes.split(",").forEach(element => {
					panel_body += `<div class="col-sm-4"><h3><a href="/recherche_direction?ligne=${element}&arret=${info.stop_name}">${element}</a></h3></div>`
				});
				document.getElementById("liste_ligne").innerHTML +=
				`
					<div class="col-sm-12">
						<div class="panel panel-default text-center">
							<div class="panel-heading" style="background-color:#DB1F20;">
								<div class="row">
									<div class="col-sm-12"><h3>${info.stop_name}</h3></div>
								</div>
							</div>
							<div class="panel-body">
								${panel_body}
							</div>
						</div>
					</div>
				`
			})
		}
	};
	xhttp.open("POST", "/tout_les_arrets", true);
	xhttp.send();

}


function route_et_destination(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {
				var panel_body = ''
				info.trip_headsigns.split('|').forEach(element => {
					var element = JSON.parse(element)
					var panel_body_body = ''
					element[1].split(',').forEach( headsign => {
						panel_body_body += `<div class="panel-body"><div class="panel-body">${headsign}</div></div>`
					});
					panel_body += `<div class="col-sm-6">
										<h3><a href="/recherche_arret?ligne=${info.route_short_name}&direction=${element[0]}">
												<div class="panel panel-default">
													${panel_body_body}
												</div>
											</a>
										</h3>
									</div>`
				});
				document.getElementById("liste_ligne").innerHTML +=
				`
				<div class="col-sm-12">
					<div class="panel panel-default text-center">
						<div class="panel-heading" style="background-color:#${info.route_color};">
							<div class="row">
								<div class="col-sm-4"><h3>${info.route_short_name}</h3></div>
								<div class="col-sm-8"><h3>${info.route_long_name}</h3></div>
							</div>
						</div>
						<div class="panel-body">
							${panel_body}
						</div>
					</div>
				</div>
				`
			})
		}
	};
	xhttp.open("POST", "/route_et_destination", true);
	xhttp.send();

}


function recherche_arret_par_ligne_direction(){

	const urlParams = new URLSearchParams(window.location.search);
	const direction = urlParams.get('direction');
	const ligne = urlParams.get('ligne')
	const champ = document.getElementById('champ').value

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {

				var panel_body = `<div class="col-sm-12"><h3><a href="/horraire?ligne=${ligne}&arret=${info.stop_name}&direction=${direction}">Horaires</a></h3></div>`

				document.getElementById("liste_ligne").innerHTML +=
				`
					<div class="col-sm-12">
						<div class="panel panel-default text-center">
							<div class="panel-heading" style="background-color:#DB1F20;">
								<div class="row">
									<div class="col-sm-12"><h3>${info.stop_name}</h3></div>
								</div>
							</div>
							<div class="panel-body">
								${panel_body}
							</div>
						</div>
					</div>
				`
			})
		}
	};
	xhttp.open("POST", `/recherche_arret_par_ligne_direction?ligne=${ligne}&direction=${direction}&arret=${champ}`, true);
	xhttp.send();

}
function recherche_arret(){

	const urlParams = new URLSearchParams(window.location.search);
	const direction = urlParams.get('direction');
	const ligne = urlParams.get('ligne')

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			tab.forEach( info => {

				var panel_body = `<div class="col-sm-12"><h3><a href="/horraire?ligne=${ligne}&arret=${info.stop_name}&direction=${direction}">Horaires</a></h3></div>`

				document.getElementById("liste_ligne").innerHTML +=
				`
					<div class="col-sm-12">
						<div class="panel panel-default text-center">
							<div class="panel-heading" style="background-color:#DB1F20;">
								<div class="row">
									<div class="col-sm-12"><h3>${info.stop_name}</h3></div>
								</div>
							</div>
							<div class="panel-body">
								${panel_body}
							</div>
						</div>
					</div>
				`
			})
		}
	};
	xhttp.open("POST", `/recherche_arret?ligne=${ligne}&direction=${direction}`, true);
	xhttp.send();

}

function recherche_direction(){

	const urlParams = new URLSearchParams(window.location.search);
	const arret = urlParams.get('arret');
	const ligne = urlParams.get('ligne')

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''
			var panel_body = ''
			tab.forEach( info => {

				var panel_body_body = ''
				info.directions.split(',').forEach( headsign => {
					panel_body_body += `<div class="panel-body"><div class="panel-body">${headsign}</div></div>`
				});
				panel_body += `<div class="col-sm-6">
									<h3><a href="/horraire?ligne=${ligne}&arret=${arret}&direction=${info.direction_id}">
											<div class="panel panel-default">
												${panel_body_body}
											</div>
										</a>
									</h3>
								</div>`

			})

			document.getElementById("liste_ligne").innerHTML +=
			`
				<div class="col-sm-12">
					<div class="panel panel-default text-center">
						<div class="panel-heading" style="background-color:#DB1F20;">
							<div class="row">
								<div class="col-sm-6"><h3>${ligne}</h3></div>
								<div class="col-sm-6"><h3>${arret}</h3></div>
							</div>
						</div>
						<div class="panel-body">
							${panel_body}
						</div>
					</div>
				</div>`
		}
	};
	xhttp.open("POST", `/recherche_direction?ligne=${ligne}&arret=${arret}`, true);
	xhttp.send();

}
var tab_horaires=[]
function recherche_horraire(){

	const urlParams = new URLSearchParams(window.location.search);
	const direction = urlParams.get('direction');
	const ligne = urlParams.get('ligne')
	const arret = urlParams.get('arret')

	var hash = hashCode(window.location.search)
	var item = localStorage.getItem(hash);
	if (item === null){
		document.getElementById('favoris').innerHTML='<span class="glyphicon glyphicon-star-empty"></span>'
	}
	else {
		document.getElementById('favoris').innerHTML='<span class="glyphicon glyphicon-star"></span>'
	}

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var tab = JSON.parse(xhttp.responseText);
			document.getElementById("liste_ligne").innerHTML= ''

			var panel_body = ''
			tab.forEach( (info,i) => {

				var temp = info.Horraire.split(':')
				var heure  = (parseInt(temp[0],10)%24).toString().padStart(2,"0")
				var minutes = parseInt(temp[1])
				var secondes =parseInt(temp[2])
				var TEMPS = heure+':'+minutes+':'+secondes
				tab_horaires.push( ((heure*60)+minutes)*60+secondes)

				panel_body +=`<div class="col-sm-12 panel panel-default" id='${i}'
								onclick="window.location='https://data.angers.fr/explore/embed/dataset/bus-tram-position-tr/map/?refine.mnemoligne=${ligne}&location=17,${info.stop_lat},${info.stop_lon}&basemap=jawg.transports'")
							>
								<div class="col-sm-6"><h3>${TEMPS}</h3></div>
								<div class="col-sm-6"><h3>${info.trip_headsign}</h3></div>
							</div>`

			})
			document.getElementById("liste_ligne").innerHTML +=
				`
					<div class="col-sm-12">
						<div class="panel panel-default text-center">
							<div class="panel-heading" style="background-color:#${tab[0].route_color};">
								<div class="row">
									<div class="col-sm-6"><h3>${ligne}</h3></div>
									<div class="col-sm-6"><h3>${arret}</h3></div>
								</div>
							</div>
							<div class="panel-body">
								${panel_body}
							</div>
						</div>
					</div>
				`
		}
	};
	xhttp.open("POST", `/recherche_horraire?ligne=${ligne}&direction=${direction}&arret=${arret}`, true);
	xhttp.send();

}
function next_stop(){
	var d = new Date()
	var heure  = d.getHours()
	var minutes = d.getMinutes()
	var secondes = d.getSeconds()

	var temps = ((heure*60)+minutes)*60+secondes


	var next_stop_id  = tab_horaires.findIndex((element) => element > temps)

	if (next_stop_id != -1){
		console.log(next_stop_id)
		document.getElementById(next_stop_id).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})

	}
	else {
		alert("Plus de passage aujourd'hui")
	}

}
