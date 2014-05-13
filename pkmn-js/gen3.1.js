// gen3.1.js
// File for TPP FireRed events
// 

// Flameslash
addEvent(new Pokemon({
	name : "Flameslash",
	// sprite: "img/pkmn/flameslash.png",
	// x: 28, y: -18,
	sprite: "img/pkmn/flamesplash.gif",
	x: -11, y: -9,
	animation: null,
	reflection: true,
	refl_adj_y: -17,
	
	dex : "img/pkdx/frdex_flameslash.png",
	sources : {
		"Pokedex Image by /u/bboyskullkid" : "http://www.reddit.com/r/twitchplayspokemon/comments/24ouwj/i_drew_flameslash_in_sprite_form_inspired_by_the/",
	},
	
	OT: "Alice",
	gender: 2,
	gamename : "Sandslash",
	pokename : "Sandslash",
	nicknames : "Sandsplash<br/>Flamesplash",
	level : 63,
	caught : "Bought from Magikarp Man",
	memo : "Ability: Flame Body, knew Flamethrower. Thought it was a Magikarp.",
	
	ribbons : [
		new HallOfFame_Ribbon("15d 2h 2m"),
	],
}));

// DJ Slaking
addEvent(new Pokemon({
	name : "Stalinking",
	sprite: "img/pkmn/slaking.gif",
	x: 17, y: -35,
	animation : null,
	
	dex : "img/pkdx/frdex_slaking.png",
	sources : {
		"Pokedex Image by /u/carlotta4th" : "http://www.reddit.com/r/twitchplayspokemon/comments/252a2b/tpp_sprites/",
	},
	
	OT: "Alice",
	gender: 1,
	gamename : "CCCDJCCCC5",
	pokename : "Slaking",
	nicknames : "DJ<br/>DJ Stalinking",
	level : 66,
	ball : "great",
	caught : "Bought from Magikarp Man",
	memo : "Ability: Minus. Knows Fly.",
	
	ribbons : [
		new HallOfFame_Ribbon("15d 2h 2m"),
	],
}));

// Hyperbug
addEvent(new Pokemon({
	name : "Hyperbug",
	//sprite: "img/pkmn/hyperbug_ev.png",
	sprite: "img/pkmn/hyperbug_fast.gif",
	shadow: "img/pkmn/generic-shadow.png",
	x: 16, y: -25, z: 16,
	animation: "floating",
	
	dex : "img/pkdx/frdex_hyperbug.png",
	sources : {
		"Pokedex Image by /u/carlotta4th" : "http://www.reddit.com/r/twitchplayspokemon/comments/252a2b/tpp_sprites/",
	},
	
	OT: "Alice",
	gender: 1,
	gamename : "AATUUUUNN",
	pokename : "Masquerain",
	nicknames : "Tuna<br/>Beambug",
	level : 58,
	// caught : "Bought from Magikarp Man",
	memo : "Ability: Insomnia. Could use Hyper Beam its entire life.",
	
	ribbons : [
		new HallOfFame_Ribbon("15d 2h 2m"),
	],
}));

// Shellock Holmes
addEvent(new Pokemon({
	name : "Shellock",
	// sprite: "img/pkmn/hyperbug_ev.png",
	x: 16, y: -25,
	
	// dex : "img/pkdx/frdex_flameslash.png",
	
	OT: "Alice",
	gender: 1,
	gamename : "TTABCIJIJD",
	pokename : "Blastoise",
	nicknames : "Full Name: Shellock Holmes",
	level : 58,
	caught : "Caught from Route Heaven",
	memo : "Ability: Vital Spirit. Used Oder Sleuth a lot to identify pokemon. Also has an Octazooka.",
	
	ribbons : [
		new HallOfFame_Ribbon("15d 2h 2m"),
	],
}));

// Mew
addEvent(new Pokemon({
	name : "Marc",
	sprite: "img/pkmn/marc-mew.png",
	x: -29, y: 34, z: 32,
	
	dex : "img/pkdx/frdex_marc.png",
	sources : {
		"Pokedex Image by /u/carlotta4th" : "http://www.reddit.com/r/twitchplayspokemon/comments/252a2b/tpp_sprites/",
	},
	
	OT: "Alice",
	gender: 0,
	gamename : "MARC",
	pokename : "Mew",
	nicknames : "Karl Marc<br/>Mewgneto",
	level : 57,
	caught : "Traded for Nidoran&#x2642;",
	memo : "Ability: Magnet Pull.",
	
	ribbons : [
		new Traded_Ribbon("For Nidoran&#x2642; 9d 8h 14m"),
		new HallOfFame_Ribbon("15d 2h 2m"),
	],
}));

addEvent(new Pokemon({
	name : "Meow Zedong",
	sprite: "img/pkmn/meow_zedong.gif",
	x: -27, y: 35, z: 32,
	animation : null,
	adj_x : 4.5, adj_y : 1,
	
	// dex : "img/pkdx/frdex_marc.png",
	// sources : {
	// 	"Pokedex Image by /u/carlotta4th" : "http://www.reddit.com/r/twitchplayspokemon/comments/252a2b/tpp_sprites/",
	// },
	
	OT: "Alice",
	gender: 1,
	gamename : "ZDNNNG",
	pokename : "Skitty",
	nicknames : "Chairman Meow",
	level : 39,
	memo : "Ability: Magma Armor. Head of the Meowist Party.",
}));




// Snorlax/Glalie
addEvent(new Pokemon({
	name : "Glalax",
	sprite: "img/pkmn/galie_snorlax.png",
	x: -22, y: 3,
	animation: false,
	
	dex : "http://cdn.bulbagarden.net/upload/0/06/Spr_3e_362.gif", //Bulbapedia
	
	OT: "Alice",
	gender: 2,
	gamename : "Glalie",
	pokename : "Glalie",
	level : 30,
	ball: "great",
	caught : "",
	memo : "The Snorlax on Route 12 was a Galie in disguise",
	
}));


//POKE DUDE!! (aka, Primo)
addEvent(new Person({
	name : "PokeDude",
	spritesheet : "img/trainers/pokedude.png",
	x: -22, y: 9,
	
	behavior: behavior.meander,
	behavArg : {
		"left" : -27, "top" : 4,
		"right": -20, "bottom" : 13,
	},
	
	dialog : [
		"Remember, Trainers, a good deed a day brings happiness to stay!",
		"Remember, Trainers, a good deed a day brings happiness to stay!", //2x as likely to appear
		"Come on, let me here you! HELLO, TRAINERS! It's me, the POK&eacute; DUDE!",
		"If a POK&eacute;MON develops a status problem, heal it right away!",
		"Keep your eyes glued to the super<br/>POK&eacute; DUDE SHOW!",
		"If your first POK&eacute; BALL fails to catch the POK&eacute;MON, don't give up! Keep throwing POK&eacute; BALLS... It's bound to work sometime!",
		"If you don't know how type matchups work, battles will be tough!",
		"For the COOL-type POK&eacute; DUDE, AWESOME-type kids like you match up perfectly!",
		"FOCUS PUNCH doesn't sound like anything a bird or fish POK&eacute;MON can learn. So, try using it on a POK&eacute;MON with arms that can throw punches!",
		"You've given yourself one-touch access to TEACHY TV! That kind of attention is a little embarrasing!",
	],
}));

//And some Randomized Pokemon to prove Poke Dude wrong on that Focus Punch point
addEvent(new Event({
	name : "Punching Taillow",
	sprite : "img/pkmn/taillow_punching.png",
	x: -28, y: 13,
	
	animation: "breathe",
	
	doClick : Person.fn.doClick,
	updateImage : function(){},
	
	dialog_assignment : "random",
	dialog : [
		"Wild TAILLOW used MEGA PUNCH!",
	],
}));

addEvent(new Event({
	name : "Kicking Diglett",
	sprite : "img/pkmn/diglett.gif",
	x: -30, y: 16,
	
	doClick : Person.fn.doClick,
	updateImage : function(){},
	
	dialog_assignment : "random",
	dialog : [
		"Wild DIGLETT used HIGH JUMP KICK!",
	],
}));


addEvent(new Pokemon({
	name: "Pikachu",
	sprite: "img/pkmn/shiny-pikachu.gif",
	x: -36, y: -9,
	
	dex: "http://cdn.bulbagarden.net/upload/9/96/Spr_3f_025_s.png", //Bulbapedia
	
	OT: "--",
	gamename: "--",
	pokename: "Pikachu",
	level: "???",
	memo: "TPP's second random shiny, killed in battle.",
}));


// And finally, Alice!
addEvent(new Trainer({
	name : "A",
	spritesheet : "img/trainers/aj.png",
	x: 20, y: 2,
	
	dex : "img/pkdx/trainer_alice.png",
	sources : {
		"Alice Sprite by /u/KingdomXathers":"http://www.reddit.com/r/twitchplayspokemon/comments/23tl7o/made_a_sprite_for_aalice_this_is_more_of_a_wip/", 
	},
	
	nickname : "Alice",
	playtime: "15d 2h 2m",
	pokedex : "56 own/303 seen",
	releasecount : 1,
	idnum : "56171",
	
	info_html : 
		"Number of E4 Attempts: 8<br/>"+
		"Times Blacked Out: 89+<br/>"+
		"<br/>"+
		"<br/>"+
		"",
	icons : [
		"img/icn/teachy_tv.png",
		"img/icn/dome_fossil.png",
		"img/icn/poke_doll.png",
		"img/icn/amber_charizard.png",
		"img/pkmn/potato.png",
		null,// "img/icn/slowpoke_tail.png",
	],
	
	badge_html : "",
	
	behavior: null,
	// behavior: behavior.meander,
	// behavArg : {
	// 	"left" : -10, "top" : -38,
	// 	"right": -10, "bottom": -37,
	// },
}));