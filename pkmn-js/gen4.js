// gen4.js
// File for TPP Platinum events
// - or -
// HOW THE HELL DO I CODE NAMES WITH FREAKING UMBRELLAS IN THEM?!?! O_o
//

// Released Pokemon: Their stories are finished, they can enter the Park

addEvent(new Pokemon({
	name : "Oreo",
	sprite: "img/pkmn/bidoof-oreo.png",
	x: 14, y: -29,
	
	dex : "http://cdn.bulbagarden.net/upload/a/ae/Spr_4p_399_f.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
		"Sprite is Flair by /u/RT-Pickred": "",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : "1 OORROOOO",
	pokename : "Bidoof",
	level : 15,
	// memo : "",
	
	ribbons : [
		new Released_Ribbon("0d 5h 34m"),
		new Record_Ribbon("Fastest Release"),
	],
}));

//
// Note: Chimchar is attached to the Released Starter Campfire multi-event 
// defined in the "other" events file. See there for her event definition.
//

addEvent(new Pokemon({
	name : "Bidoof",
	// sprite: "img/pkmn/bidoof.png",
	x: 7, y: -24,
	
	dex : "http://cdn.bulbagarden.net/upload/f/f2/Spr_4p_399_m.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "nqpppnl",
	gender: 1,
	gamename : "nppmwB9◊Im",
	pokename : "Bidoof",
	nicknames : "",
	// level : 5,
	// memo : "",
	
	ribbons : [
		new Pokerus_Ribbon(),
		new Released_Ribbon("8d 14h 35m"),
	],
}));

addEvent(new Pokemon({
	name: "Geodude",
	sprite: "img/pkmn/shiny-geodude.gif",
	x: -43, y: -10,
	
	dex: "http://cdn.bulbagarden.net/upload/b/b0/Spr_4p_074_s.png", //Bulbapedia
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "--",
	gamename: "--",
	pokename: "Geodude",
	caught: "Encountered by nqpppnl.",
	level: 20,
	memo: "TPP's third random shiny, killed in battle.",
}));


// Master Geodude
addEvent(new Pokemon({
	name : "Geodude",
	sprite: "img/pkmn/master-geodude.png",
	x: -30, y: -10,
	
	dex : "http://cdn.bulbagarden.net/upload/b/b7/Spr_4p_074.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : "Geodude",
	pokename : "Geodude",
	nicknames : "Master Dude",
	level : 17,
	memo : "Caught using the masterball.",
	ball: "master",
	
	ribbons : [
		new Master_Ribbon(),
	],
}));


////////////////////////
// Steve and Moonbat

addEvent(new Building({
	name: "Steve's Belfry",
	sprite: "img/bld/belfry.png",
	x: 3, y: -13,
//	x: -22, y: -12,
	
	warp_x: 32, warp_y: 56,
}));

addEvent(new MultiEvent({
	name: "Steve and Moonbat Popcorn",
	sprite: "img/pkmn/brozong_moonbat_popcorn.gif",
	x: 95, y: -16, z: (38-16)*16,
	adj_x: 5, adj_y: 2,
}).addSubEvent("0,0,26,23", new Pokemon({
	name : "Steve",
	// sprite: "img/pkmn/bronzong.png",
	// x: -37, y: -25,
	
	dex : "img/pkdx/ptdex_bronzong.png",
	sources : {
		"Pokedex Image by /u/Sorceress_Feraly" : "http://www.reddit.com/r/twitchplayspokemon/comments/2649go/some_platinum_team_sprites_and_some_bonus_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 0,
	gamename : "Bronzong",
	pokename : "Bronzong",
	nicknames : "Captain America<br/>Captain Unova",
	level : 68,
	memo : "First to contract the Pokerus virus, named Captain America for this feat.",
	
	ribbons : [
		new Record_Ribbon("First to catch PkRS"),
		new Pokerus_Ribbon(),
		//new Daycare_Ribbon("To Learn Something"),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
})).addSubEvent("18,21,44,37", new Pokemon({
	name : "Moonbat",
	// sprite: "img/pkmn/sunshine_shinx.png",
	// x: -37, y: -25,
	
	dex : "img/pkdx/ptdex_moonbat.png",
	sources : {
		"Pokedex Image by /u/Sorceress_Feraly" : "http://www.reddit.com/r/twitchplayspokemon/comments/2649go/some_platinum_team_sprites_and_some_bonus_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 1,
	gamename : "Golbat",
	pokename : "Golbat",
	nicknames : "",
	level : 54,
	memo : "Pretty chill dude. Often seen holding a coffee cup. Somehow.",
	
	ribbons : [
		new Pokerus_Ribbon(),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
}))
);




addEvent(new MultiEvent({
	name: "The Royal Family",
	sprite: "img/pkmn/sunbrella_family.gif",
	x: 29, y: 36,
}).addSubEvent("23,0,23,12,32,15,32,25,47,25,47,0", new Pokemon({
	name : "Sunbrella",
	
	dex : "img/pkdx/ptdex_sunbrella.png",
	sources : {
		"Pokedex Image by /u/carlotta4th" : "http://www.reddit.com/r/twitchplayspokemon/comments/252a2b/tpp_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : "!☂!!☀! !:1",
	pokename : "Roserade",
	nicknames: "The Empress<br/>Queen",
	level : 71,
	memo : "Evolved to Roselia via Rare Candy by anti-evolution trolls spamming the menu button.",
	
	ribbons : [
		new Daycare_Ribbon("To Learn Petal Dance"),
		new Pokerus_Ribbon(),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
})).addSubEvent("0,0,20,25", new Pokemon({
	name : "Roselio",
	
	dex : "http://cdn.bulbagarden.net/upload/9/9d/Spr_4p_315_m.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "nqpppnl",
	gender: 1,
	gamename : "Roselia",
	pokename : "Roselia",
	level : 24,
	memo: "Caught before Napoleon's coma, lost to the time Paradox.",
	
	ribbons : [
		new Daycare_Ribbon("To Love Sunbrella"),
		new Released_Ribbon("12d 10h 32m* <br/>(*Lost to Paradox)"),
		//No badges after this, so they don't bleed into one another.
	],
})).addSubEvent("21,16,30,25", new Pokemon({
	name : "Roselia Egg",
	
	dex : "http://cdn.bulbagarden.net/upload/d/dc/Spr_3r_Egg.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "---",
	gender: 0,
	gamename : "???",
	pokename : "Roselia",
	level : 1,
	memo: "This egg was declined by Napoleon. It never had a chance to exist even before the Time Paradox.",
	
	ribbons : [
		new Daycare_Ribbon("Born"),
	],
}))
);


addEvent(new MultiEvent({
	name: "Sunflare",
	sprite: "img/pkmn/sunflare.gif",
	x: 23, y: 38,
}).addSubEvent("0,10,0,26,35,26,35,6,32,7,28,14,20,18,11,11", new Pokemon({
	name : "Solareon",
	// sprite: "img/pkmn/sunshine_shinx.png",
	// x: -37, y: -25,
	
	dex : "img/pkdx/ptdex_solareon.png",
	sources : {
		"Pokedex Image by /u/Sorceress_Feraly" : "http://www.reddit.com/r/twitchplayspokemon/comments/2649go/some_platinum_team_sprites_and_some_bonus_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 1,
	gamename : "Flareon",
	pokename : "Flareon",
	nicknames : "Sun Prophet<br/>Flame Jesus",
	level : 97,
	memo : "Said to have broken the Fire Starter curse by entering the Hall of Fame.",
	
	ribbons : [
		new Pokerus_Ribbon(),
		new Daycare_Ribbon("Had a baby?!"),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
})).addSubEvent("0,0,0,9,11,11,19,18,27,13,32,6,35,5,35,0", new Pokemon({
	name : "Sunshine",
	// sprite: "img/pkmn/sunshine_shinx.png",
	x: -37, y: -25,
	
	dex : "img/pkdx/ptdex_sunshine.png",
	sources : {
		"Pokedex Image by /u/Sorceress_Feraly" : "http://www.reddit.com/r/twitchplayspokemon/comments/2649go/some_platinum_team_sprites_and_some_bonus_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : '0"☀ ☀0☀☺ &#9785;',
	pokename : "Shinx",
	nicknames : "Sparkles",
	level : 63,
	memo : "Forever unable to evolve...",
	ball : "heal",	
	
	ribbons : [
		new Daycare_Ribbon("To Learn Discharge"),
		new Pokerus_Ribbon(),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
}))
);

addEvent(new Pokemon({
	name : "Agent 006",
	sprite: "img/pkmn/agent_006.gif",
	x: 11, y: 34,
	animation: null,
	
	dex : "img/pkdx/ptdex_006.png",
	sources : {
		"Pokedex Image by /u/Sorceress_Feraly" : "http://www.reddit.com/r/twitchplayspokemon/comments/2649go/some_platinum_team_sprites_and_some_bonus_sprites/",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : "00&nbsp;&nbsp;00&nbsp;06",
	pokename : "Bibarel",
	nicknames : "",
	level : 93,
	memo : "Had a baby bidoof with Solareon. Some say as a sorrogate mother.",
	
	ribbons : [
		// new Pokerus_Ribbon(), //caught after the outbreak
		new Daycare_Ribbon("Had a baby?!"),
		new HallOfFame_Ribbon("17d 11h 39m"),
	],
}));

addEvent(new MovingPokemon({
	name : "Baby Bidoof",
	spritesheet: "img/pkmn/baby_doof.png",
	x: 20, y: 33,
	
	
	dex : "http://cdn.bulbagarden.net/upload/f/f2/Spr_4p_399_m.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
	},
	
	OT: "nqpppnl",
	gender: 1,
	gamename : "???",
	pokename : "Bidoof",
	nicknames : "FlareDoof",
	level : 1,
	memo : "Child of Solareon and Agent 006. Has Solareon's Rock Smash. Did not hatch during stream.",
	
	ribbons : [
		new Daycare_Ribbon("Born"),
	],
	
	frame_width : 18,
	frame_height : 16,
	
	behavior: function() {
		this.actTimer--;
		if (this.actTimer > 0) return; //do nothing this time
		
		if (!this.behavArg 
		|| !this.behavArg["top"] === undefined || !this.behavArg["left"] === undefined 
		|| !this.behavArg["bottom"] === undefined || !this.behavArg["right"] === undefined) 
		{
			console.error("No or invalid arguments given to behavior function!");
			this.actTimer = 10000;
			return;
		}
		
		if (this._d_x !== undefined) return; //still animating, let be
		
		var dirChoice = Math.floor(Math.random()*32);
		
		if (dirChoice < 4) { //face direction
			this.direction = dirChoice;
			this.updateImage();
			
		} else { //walk!
			var evtobj = this;
			var arg = this.behavArg;
			
			this.direction = dirChoice % 4;
			var _x = this.x;
			var _y = this.y;
			
			switch(this.direction) {
				case 0: _y += 2; break; //down
				case 1: _y -= 2; break; //up
				case 2: _x -= 2; break; //left
				case 3: _x += 2; break; //right
			}
			
			if (_x >= arg.left && _x <= arg.right
			&& _y >= arg.top && _y <= arg.bottom)
			{
				var progress = function(_p, progress) {
					var newFrame;
					var height = Math.abs(Math.sin(progress * 2*Math.PI) * 8);
					
					if (height > 2) {
						newFrame = 1;
					} else {
						newFrame = 0;
					}
					
					evtobj.domImage.css("bottom", height);
					
					if (newFrame != evtobj.animFrame) {
						evtobj.animFrame = newFrame;
						evtobj.updateImage();
					}
				};
				
				this._d_x = _x;
				this._d_y = _y;
				$(this.domElement).animate({
					left : _x * 16,
					top : _y * 16,
					"z-index" : ZBASE + _y,
				}, {
					duration: 500,
					easing: "linear",
					progress : progress,
					complete : function(){
						evtobj.x = _x;
						evtobj.y = _y;
						evtobj._d_x = evtobj._d_y = undefined;
					}
				})
			}
			this.updateImage();
		}
	},
	behavArg: {
		top: 32, left: 13,
		bottom: 36, right: 27,
	},
	
}));


addEvent(new Pokemon({
	name : "Togepi",
	sprite: "img/pkmn/kk-roy.png",
	x: 16, y: -33,
	
	dex : "http://cdn.bulbagarden.net/upload/0/07/Spr_4p_175.png",
	sources : {
		"Pokedex Image from Bulbapedia" : "",
		"Sprite is Flair by /u/RT-Pickred": "",
	},
	
	OT: "nqpppnl",
	gender: 2,
	gamename : "KK♀ROOOY",
	pokename : "Togepi",
	nicknames : "",
	level : 48,
	memo : "Had lots of fun in the Day Care",
	
	ribbons : [
		new Daycare_Ribbon("Common Resident"),
		new Pokerus_Ribbon(),
	],
}));


// And finally, Nepoleon himself!
addEvent(new Trainer({
	name : "nqpppnl",
	spritesheet : "img/trainers/napoleon.png",
	x: -9, y: 13,
	
	dex : "http://cdn.bulbagarden.net/upload/6/6b/Spr_Pt_Lucas.png",
	sources : {
		"Lucas Sprite from Bulbapedia":"", 
	},
	
	nickname : "Napoleon",
	playtime: "17d 11h 39m",
	pokedex : "52 own/206 seen",
	releasecount : "4 (+22)",
	idnum : "12339",
	
	info_html : 
		"Number of E4 Attempts: 49<br/>"+
		"Times Blacked Out: 173<br/>"+
		"Number of Wooper Caught: 20<br/>"+
		"Number of Times Time Traveled: 2<br/>"+
		"Number of Pokeballs Bought: 400+",
	icons : [
		"img/icn/coin_case.png",
		"img/icn/air_mail.png",
		"img/icn/poke_ball.png",
		"img/icn/shiny_stone.png",
		"img/icn/contest_pass.png",
		"img/icn/sun_stone.png",
	],
	
	badge_html : "",
	
	behavior: behavior.look,
	
	dialog: [ 
		"YOU SPELLED MY NAME WRONG!!",
		"HELLO?! Anyone want to FIX MY NAME ON THIS SIGN?!?!",
		"It's <em>NA</em>poleon! NAH! As in you can DO NOTHING TO MAKE ME HAPPY ABOUT THIS!!",
		"I pay GOOD MONEY at the Game Corner and they CAN'T EVEN SPELL MY NAME RIGHT?!",
	],
	dialog_assignment: "random",
	
	doClick : function(){
		Person.fn.doClick.call(this);
		this.openTrainerCard();
	},
}));

//And his very own Game Corner!
addEvent(new Building({
	name: "Game Corner",
	sprite: "img/bld/gamecorner.png",
	x : -7, y : 12,
	warp_x: 48, warp_y: 48,
}));

addEvent(new Building({
	name: "Game Corner Congrats Sign",
	sprite: "img/bld/gamecorner_sign.png",
	x : -7, y : 13, 
	warp_x: 44, warp_y: 37,
}));
