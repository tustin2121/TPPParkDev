// stadium.js
// File for the Stadium events (during TPP Platinum)
// 

//Stadium Manager GO!
(function(){
	var SCREEN_W = 54;
	var SCREEN_H = 33;
	
	var STATE_RIOTING = 1; //ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ
	var STATE_DECIDING = 5; //deciding on battlers
	var STATE_VOTING = 10;
	var STATE_BATTLING = 20;
	var STATE_WINNINGS = 30;
	
	var chatterDom = [];
	var chatterContainer;
	
	var redvotes = [];
	var bluevotes = [];
	
	var redfavor = 0;
	var bluefavor = 0;
	
	var redPokes = [];
	var bluePokes = [];
	
	var redDom = [];
	var blueDom = [];
	
	var redCurrMon = null;
	var blueCurrMon = null;
	
	var currState = 0;
	var countdown = 0;
	
	var eventlist = [];
	var eventIntervalId = 0;
	
	window.setStadiumState = function(state){
		goToState(state);
	}
	
	function testScreenSupport() {
		var canvas = $("<canvas>");
		if (!(canvas[0].getContext && canvas[0].getContext('2d')))
			return false;
		return true;
	}
	
	function doStadium() {
		if (currState == 0) doInit();
		
		//this = the stadium entrance event
		if (this._isActive && !eventIntervalId) {
			//If the stadium was kicked back into active, activate all of its events
			eventIntervalId = setInterval(fireStadiumBehaviors, 250);
			console.log("Stadium activate!", eventIntervalId);
		}
		
		if (countdown > 0) countdown--;
		
		switch(currState) {
			case STATE_DECIDING: doDeciding(); break;
			case STATE_VOTING: doVoting(); break;
			case STATE_BATTLING: doBattle(); break;
			case STATE_WINNINGS: doWinnings(); break;
			case STATE_RIOTING: doRioting(); break;
		}
	}
	
	function checkStadiumActive() {
		if (!this._isActive && eventIntervalId) {
			//halt stadium events when outside the active area
			clearInterval(eventIntervalId);
			eventIntervalId = 0;
			console.log("Stadium deactivate!");
		}
	}
	
	function doInit() {
		//Create people randomly!
		for (var x = 70; x <= 95; x++) {
			//Skip stairs
			if (x == 71 || x == 79 || x == 86 || x == 94) continue;
			for (var y = -37; y <= -31; y++) {
				if (x > 79 && x < 86 && y < -34) continue; //skip screen area
				
				var shouldSpawn = Math.random();
				if (shouldSpawn > 0.85) continue; //randomly skip patrons
				
				var patron = null;
				if (NAMED_PATRONS.length && shouldSpawn > 0.85 - Math.max(8-Math.abs(82-x), 0)*0.01) { //spawn predefed patrons sometimes
					var pnum = Math.floor(Math.random() * NAMED_PATRONS.length);
					var np = NAMED_PATRONS.splice(pnum, 1)[0];
					
					patron = new Patron({
						name : np.name,
						style : np.style,
						dialog: np.dialog,
						x: x, y: y,
					});
				}
				
				if (!patron) {
					var pnum = Math.floor(Math.random() * RANDOM_NAMES.length);
					var name = RANDOM_NAMES.splice(pnum, 1)[0];
					
					patron = new Patron({
						name : name,
						style : Math.floor(Math.random()*44),
						x: x, y: y,
					});
				}
				
				addEvent(patron);
				eventlist.push(patron);
			}
		}
		
		var chat;
		for (var i = 0; i < 10; i++) {
			chat = $("<div>").addClass("stadium-chatter");
			chatterContainer.append(chat);
			chatterDom.push(chat);
		}
		
		//Create the combatants!
		var pkmn;
		pkmn = new Combatant({ team: 1, x: 91, y: -28 });
		addEvent(pkmn); eventlist.push(pkmn); redDom.push(pkmn);
		pkmn = new Combatant({ team: 1, x: 92, y: -27 });
		addEvent(pkmn); eventlist.push(pkmn); redDom.push(pkmn);
		pkmn = new Combatant({ team: 1, x: 93, y: -26 });
		addEvent(pkmn); eventlist.push(pkmn); redDom.push(pkmn);
		
		pkmn = new Combatant({ team: 2, x: 74, y: -28 });
		addEvent(pkmn); eventlist.push(pkmn); blueDom.push(pkmn);
		pkmn = new Combatant({ team: 2, x: 73, y: -27 });
		addEvent(pkmn); eventlist.push(pkmn); blueDom.push(pkmn);
		pkmn = new Combatant({ team: 2, x: 72, y: -26 });
		addEvent(pkmn); eventlist.push(pkmn); blueDom.push(pkmn);
			
		if (!testScreenSupport()) //Screen doesn't work! RIOT!
			goToState(STATE_RIOTING);
		else
			goToState(STATE_DECIDING);
	}
	
	function fireStadiumBehaviors() {
		$.each(eventlist, function(i, obj){
			if (!obj.stadiumBehavior || !$.isFunction(obj.stadiumBehavior)) return;
			obj.stadiumBehavior();
		});
	}
	
	function doDeciding() {
		var team = redPokes;
		if (team.length == 3) team = bluePokes;
		if (team.length < 3) {
			
			var rnd; 
			while (true) {
				rnd = Math.floor(Math.random()*POKEMON.length);
				
				var poke = POKEMON[rnd];
				if (poke.forbidden) continue; //try again for a not forbidden pokemon
				if (team[0] && team[0] == rnd) continue; //same pokemon, try again
				if (team[1] && team[1] == rnd) continue; //same pokemon, try again
				
				team.push(rnd);
				break;
			}
		} else {
			//decide team favor number now
			var red = [ POKEMON[ redPokes[0]], POKEMON[ redPokes[1]], POKEMON[ redPokes[2]] ];
			var blue= [ POKEMON[bluePokes[0]], POKEMON[bluePokes[1]], POKEMON[bluePokes[2]] ];
			
			redfavor  = calcFavor(red, blue);
			bluefavor = calcFavor(blue, red);
			
			console.log("Red Team: ", red[0].name, red[1].name, red[2].name, redfavor);
			console.log("Blue Team: ", blue[0].name, blue[1].name, blue[2].name, bluefavor);
			
			redDom[0].setPokemon(redPokes[0]);
			redDom[1].setPokemon(redPokes[1]);
			redDom[2].setPokemon(redPokes[2]);
			
			blueDom[0].setPokemon(bluePokes[0]);
			blueDom[1].setPokemon(bluePokes[1]);
			blueDom[2].setPokemon(bluePokes[2]);
			
			goToState(STATE_VOTING);
			return;
		}
		
		countdown = 4;
	}
	
	function doVoting() {
		// placeBet(true);
		// placeBet(false);
		
		if (countdown <= 0) goToState(STATE_BATTLING);
	}
	
	function doBattle() {
		//Battle Manager determines going to Winnings state 
	}
	
	function doWinnings() {
		if (countdown <= 0) { //Battle Cleanup
			redCurrMon = null; blueCurrMon = null;
			redfavor = bluefavor = 0;
			
			redvotes = [];
			bluevotes = [];
			redPokes = []; 
			bluePokes = [];
			
			for (var i = 0; i < 3; i++) {
				redDom[i].domElement.fadeOut(500);
				blueDom[i].domElement.fadeOut(500);
			}
			
			lastBattleAction = 0;
			
			goToState(STATE_DECIDING);
		} 
	}
	
	function doRioting() {
		if (countdown == 0) goToState(STATE_DECIDING);
	}
	
	function calcFavor(myTeam, oppTeam) {
		var overall = 1;
		
		for (var i = 0; i < 3; i++) {
			var poke = myTeam[i];
			var pokefavor = 1;
			
			//check my type 1 versus opponents' types 1 and 2
			var type1 = poke.type;
			for (var j = 0; j < 3; j++) {
				var oppPoke = oppTeam[j];
				
				var type2 = oppPoke.type;
				var f = TYPECHART[type1][type2];
				
				var type2 = oppPoke.type2;
				if (type2 !== null)
					f *= TYPECHART[type1][type2];
				
				pokefavor *= Math.max(f, 0.25);
			}
			
			pokefavor *= poke.favor; //factor in overall favor
			
			overall *= pokefavor;
		}
		return overall;
	}
	
	
	function goToState(state) {
		currState = state;
		switch (state) {
			case STATE_DECIDING: 
				//10% of the time, just randomly riot for a while :P
				if (Math.random() > 0.9) {
					countdown = 120 + Math.floor(Math.random()*120); //1-2 minutes
					currState = STATE_RIOTING;
					console.log("ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
				} else {
					//normally:
					countdown = 4; //2 seconds between decisions
				}
				break;
			case STATE_VOTING: 
				countdown = 120; //1 minute (in 0.5 sec increments)
				break;
			case STATE_BATTLING:
				countdown = -1; //disabled
				break;
			case STATE_WINNINGS:
				countdown = 30; //15 seconds
				break;
			case STATE_RIOTING:
				countdown = -1; //disabled
				break;
		}
	}
	
	function placeBet() {
		var split = redfavor / (redfavor + bluefavor);
		var n = Math.random();// * 65535;
		var red = n < split; //if the random number hits below the favor split, its a red vote
		
		//var red = Math.floor((rnd * 3019) % 2)+1;
		if (red) {
			var index = Math.floor(((n*49631) % 256) * redvotes.length);
			redvotes.splice(index, 0, (n * 65565) % 3019);
		} else {
			var index = Math.floor(((n*49631) % 256) * bluevotes.length);
			bluevotes.splice(index, 0, (n * 65565) % 3019);
		}
		
		return red+1;
	}
	
	function submitChatter(msg) {
		if (Math.random() > 0.5) return; //outright reject half of the requests
		var chat = chatterDom.shift();
		if (!chat) return; //no available chatter messages, ignore request
		
		chat
			.html(msg)
			.css({
				left: (Math.random()*80) + "%",
				top: (Math.random()*100) + "%",
			}).show().delay(1200).fadeOut(10, function(){
				chatterDom.push(chat); //return this to the queue
			});
	}
	
	//////////// Battle Manager! /////////////
	
	var lastBattleAction = 0;
	
	//Sub states during battle
	var BATTLE_RED_SEND = 1;
	var BATTLE_BLU_SEND = 2;
	var BATTLE_RED_FAINTS = 3;
	var BATTLE_BLU_FAINTS = 4;
	
	var BATTLE_RED_MISSES = 10;
	var BATTLE_RED_HIT_INEFF = 11;
	var BATTLE_RED_HIT_NORM = 12;
	var BATTLE_RED_HIT_SUPER = 13;
	var BATTLE_RED_HIT_CRIT = 14;
	
	var BATTLE_BLU_MISSES = 20;
	var BATTLE_BLU_HIT_INEFF = 21;
	var BATTLE_BLU_HIT_NORM = 22;
	var BATTLE_BLU_HIT_SUPER = 23;
	var BATTLE_BLU_HIT_CRIT = 24;
	
	var BATTLE_RED_WINS = 100;
	var BATTLE_BLU_WINS = 101;
	
	_bt_Cooldown = 0;
	_bt_turn = 0;
	
	function battleManager() {
		if (currState != STATE_BATTLING) return;
		if (_bt_Cooldown > 0) {
			_bt_Cooldown--; return;
		}
		
		if (redCurrMon == null) { //send out mon!
			redCurrMon = _chooseNextMon(redDom);
			if (!redCurrMon) 
				return _endBattle(false);
			
			_anim_sendMon(true, redCurrMon);
			lastBattleAction = BATTLE_RED_SEND;
			return;
		}
		
		if (blueCurrMon == null) { //send out mon!
			blueCurrMon = _chooseNextMon(blueDom);
			if (!blueCurrMon) 
				return _endBattle(true);
			
			_anim_sendMon(false, blueCurrMon);
			lastBattleAction = BATTLE_BLU_SEND;
			return;
		}
		
		//check HP here!
		if (redCurrMon.hp <= 0) {
			_anim_faintMon(redCurrMon);
			redCurrMon = null;
		}
		if (blueCurrMon.hp <= 0) {
			_anim_faintMon(blueCurrMon);
			blueCurrMon = null;
		}
		//separate the return from fainting, so both can do so at the same time
		if (!redCurrMon || !blueCurrMon) return; 
		
		
		if (_bt_turn == 0) { //red's turn
			_determineHit(true);
			
			_bt_turn = 1;
			
		} else { //blue's turn
			_determineHit(false);
			
			_bt_turn = 0;
		}
		
		
		function _determineHit(red) {
			var me, opp;
			if (red) {
				me = redCurrMon; opp = blueCurrMon;
			} else {
				me = blueCurrMon; opp = redCurrMon;
			}
			var p_me = POKEMON[me.pokemon];
			var p_opp = POKEMON[opp.pokemon];
			
			var baseDamage = 0;
			var attkType = 0;
			var rnd = Math.floor(Math.random()*4); //Detemine the type of move
			switch (rnd) {
				case 0: //Normal move
					baseDamage = 40; //base 40 attack
					attkType = Normal;
					break;
				case 1: //Type 1 move
					baseDamage = 60;
					attkType = p_me.type;
					break;
				case 2: //Type 2 move (or more powerful Type 1, if no 2nd type)
					if (p_me.type2) {
						baseDamage = 80;
						attkType = p_me.type;
					} else {
						baseDamage = 60;
						attkType = p_me.type;
					}
					break;
				case 3: //Hax (or Hax of their type if none defined)
					if (_performHax(me, opp)) {
						return; //all hax handing is in there
					} else {
						//no hax to perform! Do random status move that we don't emulate here!
						//TODO
					}
					break;
			}
			
			var damage = 0, multiplier = 1;
			if (baseDamage) {
				multiplier = TYPECHART[attkType][p_opp.type];
				if (p_opp.type2)
					multiplier *= TYPECHART[attkType][p_opp.type2];
				
				damage = baseDamage * multiplier;
			}
			
			// opp.hp -= damage;
			
			console.log((red)?"Red":"Blue", "Attacks!", damage, "Type:", rnd);
			
			_anim_monAttack(red, me);
			_anim_monHit(!red, opp, multiplier, function(){
				opp.hp -= damage;
			});
			_bt_Cooldown = 3 *4;
		}
		
		
		function _performHax(me, opp) {
			var p_me = POKEMON[me.pokemon];
			var p_opp = POKEMON[opp.pokemon];
			
			var hax = p_me.hax;
			if (!hax) hax = _getHaxForType(p_me.type);
			if (!hax) hax = _getHaxForType(p_me.type2);
			
			switch(hax) {
				case "posion":
				case "burn":
				case "para":
				case "freeze":
				case "sleep":
				
				case "curse":
				case "confusion":
				case "perish song":
				case "rollout":
				
				case "earthquake":
				case "fly":
				case "heal":
				case "explode":
				case "splash":
				case "horndrill":
				case "metronome":
				
			}
			return null;
		}
		
		function _getHaxForType(type) {
			switch (type) {
				case Normal: 	return null;
				case Fighting:	return null;
				case Flying:	return "fly";
				case Poison:	return "poison";
				case Ground:	return "earthquake";
				case Rock:		return null;
				case Bug:		return "confusion";
				case Ghost:		return "curse";
				case Steel:		return null;
				case Fire:		return "burn";
				case Water:		return null;
				case Grass:		return null;
				case Electric:	return "para"; //paralysis - don't want to spell
				case Psychic:	return null;
				case Ice:		return "freeze";
				case Dragon:	return null;
				case Dark:		return null;
			}
			return null;
		}
		
		
		
		function _endBattle(red){
			lastBattleAction = BATTLE_RED_WINS + !red;
			goToState(STATE_WINNINGS);
		}
		
		function _chooseNextMon(list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].hp > 0) {
					return list[i];
				}
			}
			return null;
		}
		function _anim_sendMon(red, event) {
			var x = ((red)? 84 : 81) * 16;
			var y = -27 * 16;
			event.domElement.animate({
				left: x, top: y,
			}, 600);
			event.domAnim
				.animate({ bottom: 16, }, 300)
				.animate({ bottom:  0, }, 300);
			_bt_Cooldown = 3 *4;
		}
		function _anim_faintMon(event) {
			event.domElement.fadeOut(400);
			event.domAnim.animate({ bottom:  -10, }, 400);
			
			_bt_Cooldown = 3 *4;
		}
		
		function _anim_monAttack(red, event) {
			event.domAnim
				.animate({ left: 8 * ((red)?-1:1), }, 150)
				.animate({ left:  0, }, 150);
		}
		function _anim_monHit(red, event, multiplier, hurtCallback) {
			var knockback = 8 * multiplier;
			var returnTime = 300;// * multiplier;
			
			event.domAnim
				.delay(200)
				.animate({ 
					left: 8 * ((red)?1:-1), 
					bottom: -3,
					// transform: "rotate("+(20 * (red)?1:-1 )+")",
				}, 200)
				.queue(function(){
					hurtCallback();
					$(this).dequeue();
				})
				.delay(1000)
				.animate({ 
					left: 0,
					bottom: 0,
					// transform: "rotate(0)",
				}, returnTime);
		}
	}
	
	// for (var i = 0; i < 200; i++) placeBet(true);
	// for (var i = 0; i < 180; i++) placeBet(false);
	
	/////////// Patron Definition ////////////
	
	function Patron(opts) {
		if (!(this instanceof Patron))
			return new Patron(opts);
		
		Event.call(this, opts);
	}
	
	Patron.fn = Patron.prototype = new Event({
		name : "<Patron>",
		sprite: 1, 
		
		direction : 0, //0 = down, 1 = up, 2 = left, 3 = right
		style : 0,
		
		delayBehaviorTimer : 0,
		domImage : null,
		vote : null, //1 = red, 2 = blue
		
		dialog: null,
		
		updateImage : function() {
			var x = -this.direction * 16;
			var y = -this.style * 22;
			
			this.domImage.css({
				"background-position" : x+"px "+y+"px",
			});
		},
		
		stadiumBehavior : function() {
			switch(currState) {
				case STATE_DECIDING: {
					this.vote = 0;
					
					var r = Math.floor(Math.random()*16);
					this.direction = (r < 4)?r:0;
					
				} break;
					
				case STATE_VOTING: {
					this.delayBehaviorTimer--;
					if (this.delayBehaviorTimer > 0) break;
					
					if (this.vote) {
						this.direction = 0;
						break;
					} 
					
					var r = Math.floor(Math.random()*8);
					this.direction = (r < 4)?r:0;
					
					var bet = Math.random();
					// console.log(bet, (countdown/120));
					if (bet > (countdown/120.0)*2) {
						//this.vote = Math.floor((bet * 3019) % 2)+1;
						//placeBet(this.vote-1);
						this.vote = placeBet();
					}
					
					this.delayBehaviorTimer = Math.random()*10;
				} break;
				
				case STATE_BATTLING: {
					this.direction = 0;
					
				} break;
				
				case STATE_RIOTING: {
					this.delayBehaviorTimer--;
					if (this.delayBehaviorTimer > 0) break;
					
					var r = Math.floor(Math.random()*32);
					this.direction = (r < 16)?r>>2:0;
					
					if (r % 4 == 0) {
						this.domImage.delay(Math.floor(Math.random()*200))
						.animate({
							bottom: 5,
						}, 150).animate({
							bottom: 0,
						}, 150);
						
						submitChatter("ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ")
					}
					
					this.delayBehaviorTimer = Math.random()*4;
				} break;
			}
			
			this.updateImage();
		},
		
		getDomElement : function() {
			if (this.domElement) return this.domElement;
			
			var base = $("<div>").addClass("event-base").attr("name", this.name);
			var img = this._createImageTag();
			
			base.append(img);
			
			this._applyShadow(base);
			
			this.domImage = img;
			this._storeElement(base);
			return base;
		},
		
		_createImageTag : function() {
			var eventobj = this;
			
			var img = $("<div>").addClass("main person")
				.css({
					position : "absolute",
					"background-image": "url(img/trainers/stadium_patrons.png)",
					bottom: -2,
				}).on("vclick", function(e){
					console.log("Patron click!");
					eventobj.doClick();
				});
			
			if (this.style < 0) { //custom patrons are in the negatives, convert for use
				img.css("background-image", "url(img/trainers/custom_patrons.png)");
				this.style = -this.style - 1;
			}
			return img;
		},
		
		doClick : function(){
			var text = this.name+": "+this.determineDialog();
			
			timeout = Math.max(4800, text.length * 80); //time out based on text length
			showDialog(text, this.domElement.position(), timeout);
		},
		
		determineDialog : function() {
			if (this.dialog) {
				if ($.isFunction(this.dialog))
					return this.dialog();
				else
					return this.dialog;
			}
			
			switch (currState) {
				case STATE_RIOTING:
					return "<span class='dondger'>ヽ༼ຈل͜ຈ༽ﾉ</span> RIOT <span class='dondger'>ヽ༼ຈل͜ຈ༽ﾉ</span>";
			}
			
			return "<span class='dondger'>ヽ༼ຈل͜ຈ༽ﾉ</span> RIOT <span class='dondger'>ヽ༼ຈل͜ຈ༽ﾉ</span>";
		}
	});
	
	/////////// Combatant Definition ////////////
	
	function Combatant(opts) {
		if (!(this instanceof Combatant))
			return new Combatant(opts);
		
		Event.call(this, opts);
		
		this.org_x = this.x;
		this.org_y = this.y;
	}
	
	Combatant.fn = Combatant.prototype = new Event({
		name : "<Combatant>",
		sprite: 1,
		org_x: 0, org_y: 0, //original location, for reset
		
		team : 0, //1=red, 2=blue
		pokemon : 0,
		hp:200,
		
		animstep: 0,
		
		delayBehaviorTimer : 0,
		domImage : null,
		dimAnim : null,
		
		setPokemon : function(num){
			this.pokemon = num;
			this.reset();
			this.updateImage();
			this.domElement.show();
		},
		
		reset : function(){
			this.x = this.org_x;
			this.y = this.org_y;
			this.hp = 200;
			
			if (POKEMON[this.pokemon].hp)
				this.hp = POKEMON[this.pokemon].hp;
			
			this.domElement.css({
				left: this.x * 16,
				top: this.y * 16,
			});
		},
		
		updateImage : function() {
			var pkmn = POKEMON[this.pokemon];
			var bg_x = (this.pokemon % 16) * 32;
			var bg_y = Math.floor(this.pokemon / 16) * 32;
			
			this.domImage.css({
				width: (this.spbg)?64:32, height: (this.spbg)?64:32,
				left: -((this.spbg)?32:16) + 8,
				"background-position": (this.spbg)?this.spbg : ("-"+bg_x+"px -"+bg_y+"px"),
			});
		},
		
		stadiumBehavior : function() {
			switch(currState) {
				case STATE_VOTING:
					this.animstep = (this.animstep+1) % 4;
					this.domImage.css("bottom", (this.animstep < 2)?-1: 0);
					break;
				case STATE_WINNINGS:
					this.animstep = (this.animstep+1) % 4;
					console.log("Dance?", this.team, lastBattleAction, this.animstep);
					if (this.animstep != 0) break;
					if (this.team == 1 && lastBattleAction == BATTLE_RED_WINS
					|| this.team == 2 && lastBattleAction == BATTLE_BLU_WINS) {
						this.domAnim
							.animate({bottom: 8}, 200)
							.animate({bottom: 0}, 200);
					}
					break;
			}
			
			//this.updateImage();
		},
		
		getDomElement : function() {
			if (this.domElement) return this.domElement;
			
			var base = $("<div>").addClass("event-base").attr("name", this.name);
			var img = this._createImageTag();
			
			base.append(img);
			
			this._applyShadow(base);
			
			this._storeElement(base);
			base.hide();
			return base;
		},
		_createImageTag : function() {
			var eventobj = this;
			
			var img = $("<div>").addClass("main")
				.css({
					position : "absolute",
					width: 32, height: 32,
					"background-image": "url(img/bld/stadium_pokemon.png)",
					bottom: 0,
				}).on("vclick", function(e){
					console.log("Patron click!");
					eventobj.doClick();
				});
			
			if (this.team == 2) { //blue team is flipped
				img.css({
					"transform": "scale(-1, 1)",
					"-ms-transform": "scale(-1, 1)",
					"-webkit-transform": "scale(-1, 1)",
				});
			}
			
			this.domImage = img;
			this.domAnim = $("<div>").addClass("helper").append(img);
			
			return this.domAnim;
		},
	});
	
	/////// Screen event definition ///////
	
	window.requestAnimationFrame = window.requestAnimationFrame || window.moxRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	
	function Screen(opts){
		if (!(this instanceof Screen))
			return new Screen(opts);
		
		Event.call(this, opts);
		this.behavior = this.drawScreen;
		
		// var _this = this;
		// this.intervalID = setInterval(function(){ _this.drawScreen(); }, 100);
	}
	Screen.fn = Screen.prototype = new Event({
		name : "<Screen>",
		sprite : 1, //we supply our own sprite
		
		canvas : null,
		context : null,
		broken : false,
		
		domImage : null,
		// intervalID : 0,
		animRequestID : 0,
		
		_createImageTag : function() {
			var eventobj = this;
			
			var img = $("<div>").addClass("main")
				.css({
					position : "absolute",
					"background-image": "url(img/bld/Stadium_screen.png)",
					top : -16 - this.z,
					left : -16,
					width: 64, height: 48,
				});
			this.domImage = img;
			
			var canvas = $("<canvas width='"+SCREEN_W+"px' height='"+SCREEN_H+"px'>");
			if (!(canvas[0].getContext && canvas[0].getContext('2d'))) {
				//No canvas support, show broken screen
				this.broken = true;
				img.css("background-position", "0px -48px");
				return img;
			}
			
			canvas.css({
				position: "absolute",
				left: 5, top: 8,
				// "background-color" : "blue",
			}).appendTo(img);
			this.canvas = canvas;
			this.context = canvas[0].getContext('2d');
			
			// $("<div>").addClass("debug").css({position: "absolute", top: "40"});
			return img;
		},
		
		drawScreen : function() {
			var _this = this;
			if (this.broken) return;
			
			var ctx = this.context;
			ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
			
			if (currState == STATE_RIOTING) { showRiotScreen(); return; }
			else { hideRiotScreen(); }
			
			
			switch (currState) {
				case STATE_BATTLING: 
					if (!this.animRequestID)
					this.animRequestID = requestAnimationFrame(drawHP);
					break;
				case STATE_RIOTING: showRiotScreen(); break;
				case -1: break;
				default: drawBetting(); break;
			}
			
			function showRiotScreen() {
				if (_this.sprite == 2) return;
				_this.domImage.css("background-position", "0px -48px");
				_this.sprite == 2; //flag
			}
			function hideRiotScreen() {
				if (_this.sprite == 1) return;
				_this.domImage.css("background-position", "0px 0px");
				_this.sprite == 1;
			}
			
			function drawBetting() {
				ctx.fillStyle = "red";
				ctx.fillRect(SCREEN_W-10, 0, 10, 3);
				
				ctx.fillStyle = "blue";
				ctx.fillRect(0, 0, 10, 3);
				
				ctx.fillStyle = "white";
				
				//red side bet
				var i = (redvotes.length ? (redvotes.length > 8? 7 : 4) : 2);
				ctx.fillRect(SCREEN_W-10-1-i, 1, i, 2);
				
				//blue side bet
				i = (redvotes.length ? (redvotes.length > 8? 7 : 4) : 2);
				ctx.fillRect(11, 1, i, 2);
				
				//middle ratio
				ctx.fillRect(SCREEN_W/2-2, 1, 4, 2);
				
				__names(bluevotes, 0, 4);
				__names(redvotes, SCREEN_W/2+1, 4);
				
				//Now filling out the names
				function __names(array, x, y) {
					ctx.save();
					ctx.translate(x, y);
					
					for (var i = 0; i < array.length; i++) {
						var n = array[i];
						switch(Math.floor(n)%6) {
							case 0:
							case 1: ctx.fillStyle = "#ffffff"; break; //red
							case 2: ctx.fillStyle = "#ac7fc9"; break; //crystal
							case 3: ctx.fillStyle = "#25c36e"; break; //emerald
							case 4: ctx.fillStyle = "#f1993e"; break; //firered
							case 5: ctx.fillStyle = "#7e8080"; break; //platinum
						}
						
						var nameW = Math.floor((1/30)*(n % 20)*(n % 25)+5); //(n % 20)+5;
						ctx.fillRect(0, i, nameW, 1);
						
						ctx.fillStyle = "white";
						ctx.fillRect(SCREEN_W/2-4, i, 3, 1);
						
						//gained or lost: #bbbbbb
						
						ctx.fillStyle = "#777777";
						ctx.fillRect(SCREEN_W/2-7, i, 3, 1);
					}
					
					ctx.restore();
				}
			}
			
			if (!_this.hpstored) {
				_this.hpstored = {
					redDelay : 20, redPos : 54, redHP: 0, redMax: 0, redName: "",
					blueDelay : 20, bluePos : -44, blueHP: 0, blueMax : 0, blueName: "",
				};
			}
			function drawHP() {
				var s = _this.hpstored;
				ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
				
				if (blueCurrMon) {
					if (s.blueDelay > 0) s.blueDelay--;
					else if (s.bluePos < 0) s.bluePos += 2;
					
					if (blueCurrMon.hp > s.blueHP) s.blueHP++;
					else if (blueCurrMon.hp < s.blueHP) s.blueHP--;
					
					if (!s.blueMax) {
						s.blueHP = blueCurrMon.hp;
						s.blueMax = POKEMON[blueCurrMon.pokemon].hp || 200;
						s.blueName = POKEMON[blueCurrMon.pokemon].name;
					}
				} else {
					if (s.blueDelay < 20) s.blueDelay++;
					else if (s.bluePos > -44) s.bluePos -= 2;
					
					s.blueHP = s.blueMax = 0;
				}
				if (s.bluePos > -44) {
					ctx.save();
					ctx.translate(s.bluePos, 1);
					
					ctx.beginPath();
					ctx.moveTo(-2, 0);
					ctx.lineTo(44, 0);
					ctx.lineTo(34, 15);
					ctx.lineTo(-2, 15);
					ctx.closePath();
					
					ctx.fillStyle = "#a6d4ff";
					ctx.strokeStyle = "1px solid #0d4f8d";
					ctx.fill();
					ctx.stroke();
					
					//HP Bar
					ctx.fillStyle = "#506858";
					ctx.fillRect(0,  9, 44, 4);
					
					var percent = Math.max((s.blueMax)? s.blueHP / s.blueMax : 0, 0);
					if (percent > 0.5) 
						ctx.fillStyle = "#70f8a8";
					else if (percent > 0.2)
						ctx.fillStyle = "#f8e038";
					else
						ctx.fillStyle = "#f85838";
					ctx.fillRect(0, 10, 44*percent, 2);
					
					ctx.font = "8px sans-serif";
					ctx.fillStyle = "black";
					ctx.fillText(s.blueName, 2, 8);
					
					ctx.restore();
				}
				
				if (redCurrMon) {
					if (s.redDelay > 0) s.redDelay--;
					else if (s.redPos > 10) s.redPos -= 2;
					
					if (redCurrMon.hp > s.redHP) s.redHP++;
					else if (redCurrMon.hp < s.redHP) s.redHP--;
					
					if (!s.redMax) {
						s.redHP = redCurrMon.hp;
						s.redMax = POKEMON[redCurrMon.pokemon].hp || 200;
						s.redName = POKEMON[redCurrMon.pokemon].name;
					}
				} else {
					if (s.redDelay < 20) s.redDelay++;
					else if (s.redPos < 54) s.redPos += 2;
					
					s.redHP = s.redMax = 0;
				}
				if (s.redPos < 54) {
					ctx.save();
					ctx.translate(s.redPos, 17);
					
					ctx.beginPath();
					ctx.moveTo(46, 0);
					ctx.lineTo(0, 0);
					ctx.lineTo(10, 15);
					ctx.lineTo(46, 15);
					ctx.closePath();
					
					ctx.fillStyle = "#ffa6a6";
					ctx.strokeStyle = "1px solid #8d0d0d";
					ctx.fill();
					ctx.stroke();
					
					//HP Bar
					ctx.fillStyle = "#506858";
					ctx.fillRect(0,  9, 44, 4);
					
					var percent = Math.max((s.redMax)? s.redHP / s.redMax : 0, 0);
					if (percent > 0.5) 
						ctx.fillStyle = "#70f8a8";
					else if (percent > 0.2)
						ctx.fillStyle = "#f8e038";
					else
						ctx.fillStyle = "#f85838";
					ctx.fillRect(0, 10, 44*percent, 2);
					
					ctx.font = "8px sans-serif";
					ctx.fillStyle = "black";
					ctx.fillText(s.redName, 7, 8);
					
					ctx.restore();
				}
				
				// $(".ui.creditnote").html("DEBUG: blue="+((blueCurrMon)?POKEMON[blueCurrMon.pokemon].name:"<none>")+" red="+((redCurrMon)?POKEMON[redCurrMon.pokemon].name:"<none>")+
				// 	"<br/>bd="+s.blueDelay+" bp="+s.bluePos+" bhp="+s.blueHP+"<br/>rd="+s.redDelay+" rp="+s.redPos+" rhp="+s.redHP);
				
				if (currState == STATE_BATTLING) {
					requestAnimationFrame(drawHP);
				} else {
					_this.animRequestID = 0;
				}
			}
		}
	});
	
	////////////////////////////////////////
	{
		//definitions of events!
		addEvent(new Building({
			name: "Pokemon Stadium 2 (Ext)",
			sprite: "img/bld/Stadium_ext.png",
			x : 76, y : -17,
			warp_x: 176, warp_y: 368,
			
			getDomElement : function(){
				var base = Building.fn.getDomElement.call(this);
				chatterContainer = $("<div>").addClass("staidum-chatter-container").appendTo(base);
				return base;
			},
			
			_createImageTag : function() {
				var img = Building.fn._createImageTag.call(this);
				img.css("pointer-events", "none");
				return img;
			},
		}));
		
		addEvent(new Building({
			name: "Pokemon Stadium 2 (Seating)",
			sprite: "img/bld/Stadium_seating.png",
			x : 80, y : -39,
			warp_x: 192, warp_y: 0,
		}));
		
		var b = new Building({
			name: "Pokemon Stadium 2 (Arena)",
			sprite: "img/bld/Stadium_arena.png",
			x : 79, y : -30,
			warp_x: 176, warp_y: 8,
			
			stadiumBehavior : battleManager,
		});
		addEvent(b);
		eventlist.push(b);
		
		b = new Building({
			name: "Pokemon Stadium 2 (Entrance)",
			sprite: "img/bld/Stadium_entrance.png",
			x : 82, y : -14,
			warp_x: 144, warp_y: 48,
			
			activeZone: {
				left: 65, right: 100,
				top: -40, bottom: -17,
			},
			
			behavior : doStadium,
			stadiumBehavior : checkStadiumActive,
		});
		addEvent(b);
		eventlist.push(b);
		
		addEvent(new Screen({
			x: 82, y: -16, z: 4*16,
		}));
		
		addEvent(new Screen({
			x: 82, y: -36,
		}));
		
	}
	
	/////////////////////////////////////////////////////////
	//Large Dexes that I don't want at the TOP of the file
	/////////////////////////////////////////////////////////
	
	////// Patron Dex //////
	var NAMED_PATRONS = [
	 	//remember, positive numbers need to be 0 based, not 1 based like the image
		{ name: "tustin2121",		style: -2,   },
		{ name: "carlotta4th",		style: -1,   },
		{ name: "VillainousWattson",style: -3,   dialog: "WAHAHAHAHAHAHA!"},
		{ name: "HedgemazeExpo",	style: 42-1, },
		{ name: "Everyle", 			style: 17-1, },
		{ name: "FruityParfait",	style: 23-1, },
		{ name: "inabox44",			style: 30-1, },
		{ name: "BigFatMantis",		style: 16-1, }, //prefers to be a scyther sprite
		{ name: "0ddd",				style: 40-1, },
		{ name: "TheObserver99",	style: 33-1, },
		{ name: "Xellotath", 		style:  8-1, },
	];
	
	////// Random Names //////
	// Pulled from the chat at various moments in time
	var RANDOM_NAMES = [
		"pikayoutwo", "mojo120", "gammaception", "16bitlink", "pastramiok", "cannified", "crinias", "clemywall", "rowena19", 
		"charrasculdi", "davetrain14", "thefminorscale", "teamotei", "cruentusdeus", "sidneyjks", "gmatt0", "sa24mi02", 
		"raberaff", "marksmanonthego", "ota_kun", "sir_roflcopter", "eksereles", "ellindsey", "zolan007", "indigoblack", 
		"reykardwhitewolf", "gadzek", "saturdayknight2", "lacexwarrior", "pooooookey", "fronsislol", "hex151", "garfinator5",
		"battleonroute", "nuniruro", "iantern", "kobocolla", "fishycheeze", "teras_ode", "tempylol", "yapok96", "16bitlink", 
		"ogolcromgog", "thexxxmgpackxxx", "lukasgc15", "justtyperight", "iambulletproof1", "indigoblack", "mawarumawaru", 
		"castformer", "gordout", "kareemabduljabbarr", "yuudachin", "3fullmetal6739", "burritobomb257", "lexbutts", 
		"magnificentjosh", "kuddel6", "murdim", "kingofredlions_", "kuroko1710", "xredleaf", "fishycheeze", "goldenzephyr5", 
		"kiba_inuzuka_akamaru", "11wizard", "heyyouwhiteboy", "ultra_mc", "kalebpresley", "reddylion", "thexxxmgpackxxx", 
		"janggun100", "woopertrooper", "tempylol", "rollbuster", "zonextreme", "passiveengie", "kosukeueki", "thebigdf74",
		"jonathan282", "thisnamehasbeentakenn", "mr_tumtums", "angryponcho", "lesqualala06", "crunchy_lime", "weneedtofistmisty", 
		"4dname", "theunconscionable", "colonelcrunch33", "hella_norcal", "ksrgaming", "fishamanp", "politicalmetrics", "peralejok",
		"worthlesskoridian", "burbalax", "z33k33", "mimilikescake", "pokemonplayspokemon", "justshootitfox", "slimoleq", "ryziken", 
		"jrat12345", "nifflerfloo", "cyborg_nausicaa", "shinysapphire", "0000map", "bhboehlert", "umpa1", "bdawg104", "maotegin", 
		"scotticus626", "drazule", "drross14", "lazyredsmurf", "sealmore", "ptcollins08", "xxfedoramasterxx", "rainesworld", 
		"magnusdau", "arcrequiem", "overpowernico", "jaannzz", "seaway1024", "fenderxbender", "fanman777", "slsvcn", 
		"xxfedoramasterxx", "inferno44", "blazegaming1", "milkdeliveryguy", "coboltnp", "quoctopus", "slimoleq", "cs1energypyre", 
		"cthaws", "redwings13400", "itdoesntmatte", "faithfulforce", "empressofsnow", "thrownoway", "penguinstein", 
		"geosspone", "i_cant_believe_you_all", "junewind", "mjbaker", "potatosaladdressing", "mo40o2naliz", "cakedayisbirthday", 
		"alifen", "erassus", "nidoking_armx", "basedazumarill", "our_lord_helix_the_great", "arazioman", "101100111000", 
	];

	////// Types //////
	var Normal = 0, Fighting = 1, Flying = 2, Poison = 3, Ground = 4, Rock = 5, Bug = 6, Ghost = 7, Steel = 8, 
		Fire = 9, Water = 10, Grass = 11, Electric = 12, Psychic = 13, Ice = 14, Dragon = 15, Dark = 16;
	
	var TYPECHART = [ //as per Gens 2 to 5, according to Bulbapedia
	//	 Nm   Fi   Fl   Ps   Gr   Rk   Bg   Gh   St   Fr   Wr   Gr   El   Ps   Ic   Dr   Dk (Defending type / Attacking type)
		[ 1 ,  1 ,  1 ,  1 ,  1 , 0.5,  1 ,  0 , 0.5,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ], // Normal
		[ 2 ,  1 , 0.5, 0.5,  1 ,  2 , 0.5,  0 ,  2 ,  1 ,  1 ,  1 ,  1 , 0.5,  2 ,  1 ,  2 ], // Fight
		[ 1 ,  2 ,  1 ,  1 ,  1 , 0.5,  2 ,  1 , 0.5,  1 ,  1 ,  2 , 0.5,  1 ,  1 ,  1 ,  1 ], // Flying
		[ 1 ,  1 ,  1 , 0.5, 0.5, 0.5,  1 , 0.5,  0 ,  1 ,  1 ,  2 ,  1 ,  1 ,  1 ,  1 ,  1 ], // Poison
		[ 1 ,  1 ,  0 ,  2 ,  1 ,  2 , 0.5,  1 ,  2 ,  2 ,  1 , 0.5,  2 ,  1 ,  1 ,  1 ,  1 ], // Ground
		[ 1 , 0.5,  2 ,  1 , 0.5,  1 ,  2 ,  1 , 0.5,  2 ,  1 ,  1 ,  1 ,  1 ,  2 ,  1 ,  1 ], // Rock
		[ 1 , 0.5, 0.5, 0.5,  1 ,  1 ,  1 , 0.5, 0.5, 0.5,  1 ,  2 ,  1 ,  2 ,  1 ,  1 ,  2 ], // Bug
		[ 0 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  2 , 0.5,  1 ,  1 ,  1 ,  1 ,  2 ,  1 ,  1 , 0.5], // Ghost
		[ 1 ,  1 ,  1 ,  1 ,  1 ,  2 ,  1 ,  1 , 0.5, 0.5, 0.5,  1 , 0.5,  1 ,  2 ,  1 ,  1 ], // Steel
		[ 1 ,  1 ,  1 ,  1 ,  1 , 0.5,  2 ,  1 ,  2 , 0.5, 0.5,  2 ,  1 ,  1 ,  2 , 0.5,  1 ], // Fire
		[ 1 ,  1 ,  1 ,  1 ,  2 ,  2 ,  1 ,  1 ,  1 ,  2 , 0.5, 0.5,  1 ,  1 ,  1 , 0.5,  1 ], // Water
		[ 1 ,  1 , 0.5, 0.5,  2 ,  2 , 0.5,  1 , 0.5, 0.5,  2 , 0.5,  1 ,  1 ,  1 , 0.5,  1 ], // Grass
		[ 1 ,  1 ,  2 ,  1 ,  0 ,  1 ,  1 ,  1 ,  1 ,  1 ,  2 , 0.5, 0.5,  1 ,  1 , 0.5,  1 ], // Electric
		[ 1 ,  2 ,  1 ,  2 ,  1 ,  1 ,  1 ,  1 , 0.5,  1 ,  1 ,  1 ,  1 , 0.5,  1 ,  1 ,  0 ], // Psychic
		[ 1 ,  1 ,  2 ,  1 ,  2 ,  1 ,  1 ,  1 , 0.5, 0.5, 0.5,  2 ,  1 ,  1 , 0.5,  2 ,  1 ], // Ice
		[ 1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 , 0.5,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  2 ,  1 ], // Dragon
		[ 1 , 0.5,  1 ,  1 ,  1 ,  1 ,  1 ,  2 , 0.5,  1 ,  1 ,  1 ,  1 ,  2 ,  1 ,  1 , 0.5], // Dark
	];
	
	////// Pokedex //////
	var POKEMON = [
		{ id : 001, name: "Bulbasaur"	, type: Grass,		type2: Poison, 	favor: 1.2},
		{ id : 002, name: "Ivysaur"		, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 003, name: "Venusaur"	, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 004, name: "Charmander"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 005, name: "Charmeleon"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 006, name: "Charizard"	, type: Fire,		type2: Flying, 	favor: 1},
		{ id : 007, name: "Squirtle"	, type: Water,		type2: null, 	favor: 1},
		{ id : 008, name: "Wartortle"	, type: Water,		type2: null, 	favor: 1},
		{ id : 009, name: "Blastoise"	, type: Water,		type2: null, 	favor: 1},
		{ id : 010, name: "Caterpie"	, type: Bug,		type2: null, 	favor: 1},
		{ id : 011, name: "Metapod"		, type: Bug,		type2: null, 	favor: 1},
		{ id : 012, name: "Butterfree"	, type: Bug,		type2: Flying, 	favor: 1},
		{ id : 013, name: "Weedle"		, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 014, name: "Kakuna"		, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 015, name: "Beedrill"	, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 016, name: "Pidgey"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 017, name: "Pidgeotto"	, type: Normal,		type2: Flying, 	favor: 1.3, chant: ["Bird Jesus", "Brian"] },
		{ id : 018, name: "Pidgeot"		, type: Normal,		type2: Flying, 	favor: 1.4, chant: ["Bird Jesus", "Brian"] },
		{ id : 019, name: "Rattata"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 020, name: "Raticate"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 021, name: "Spearow"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 022, name: "Fearow"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 023, name: "Ekans"		, type: Poison,		type2: null, 	favor: 1},
		{ id : 024, name: "Arbok"		, type: Poison,		type2: null, 	favor: 1},
		{ id : 025, name: "Pikachu"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 026, name: "Raichu"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 027, name: "Sandshrew"	, type: Ground,		type2: null, 	favor: 1},
		{ id : 028, name: "Sandslash"	, type: Ground,		type2: null, 	favor: 1},
		{ id : 029, name: "Nidoran♀"	, type: Poison,		type2: null, 	favor: 1},
		{ id : 030, name: "Nidorina"	, type: Poison,		type2: null, 	favor: 1},
		{ id : 031, name: "Nidoqueen"	, type: Poison,		type2: Ground, 	favor: 1},
		{ id : 032, name: "Nidoran♂"	, type: Poison,		type2: null, 	favor: 1},
		{ id : 033, name: "Nidorino"	, type: Poison,		type2: null, 	favor: 1},
		{ id : 034, name: "Nidoking"	, type: Poison,		type2: Ground, 	favor: 1},
		{ id : 035, name: "Clefairy"	, type: Normal,		type2: null, 	favor: 1, hax:"metronome" },
		{ id : 036, name: "Clefable"	, type: Normal,		type2: null, 	favor: 1, hax:"metronome" },
		{ id : 037, name: "Vulpix"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 038, name: "Ninetales"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 039, name: "Jigglypuff"	, type: Normal,		type2: null, 	favor: 1, hax:"sleep" },
		{ id : 040, name: "Wigglytuff"	, type: Normal,		type2: null, 	favor: 1, hax:"sleep" },
		{ id : 041, name: "Zubat"		, type: Poison,		type2: Flying, 	favor: 1},
		{ id : 042, name: "Golbat"		, type: Poison,		type2: Flying, 	favor: 1},
		{ id : 043, name: "Oddish"		, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 044, name: "Gloom"		, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 045, name: "Vileplume"	, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 046, name: "Paras"		, type: Bug,		type2: Grass, 	favor: 1},
		{ id : 047, name: "Parasect"	, type: Bug,		type2: Grass, 	favor: 1},
		{ id : 048, name: "Venonat"		, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 049, name: "Venomoth"	, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 050, name: "Diglett"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 051, name: "Dugtrio"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 052, name: "Meowth"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 053, name: "Persian"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 054, name: "Psyduck"		, type: Water,		type2: null, 	favor: 1},
		{ id : 055, name: "Golduck"		, type: Water,		type2: null, 	favor: 1},
		{ id : 056, name: "Mankey"		, type: Fighting,	type2: null, 	favor: 1},
		{ id : 057, name: "Primeape"	, type: Fighting,	type2: null, 	favor: 1},
		{ id : 058, name: "Growlithe"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 059, name: "Arcanine"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 060, name: "Poliwag"		, type: Water,		type2: null, 	favor: 1},
		{ id : 061, name: "Poliwhirl"	, type: Water,		type2: null, 	favor: 1},
		{ id : 062, name: "Poliwrath"	, type: Water,		type2: Fighting,favor: 1},
		{ id : 063, name: "Abra"		, type: Psychic,	type2: null, 	favor: 1},
		{ id : 064, name: "Kadabra"		, type: Psychic,	type2: null, 	favor: 1.4},
		{ id : 065, name: "Alakazam"	, type: Psychic,	type2: null, 	favor: 1.5},
		{ id : 066, name: "Machop"		, type: Fighting,	type2: null, 	favor: 1},
		{ id : 067, name: "Machoke"		, type: Fighting,	type2: null, 	favor: 1},
		{ id : 068, name: "Machamp"		, type: Fighting,	type2: null, 	favor: 1},
		{ id : 069, name: "Bellsprout"	, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 070, name: "Weepinbell"	, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 071, name: "Victreebel"	, type: Grass,		type2: Poison, 	favor: 1},
		{ id : 072, name: "Tentacool"	, type: Water,		type2: Poison, 	favor: 1},
		{ id : 073, name: "Tentacruel"	, type: Water,		type2: Poison, 	favor: 1},
		{ id : 074, name: "Geodude"		, type: Rock,		type2: Ground, 	favor: 1},
		{ id : 075, name: "Graveler"	, type: Rock,		type2: Ground, 	favor: 1},
		{ id : 076, name: "Golem"		, type: Rock,		type2: Ground, 	favor: 1},
		{ id : 077, name: "Ponyta"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 078, name: "Rapidash"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 079, name: "Slowpoke"	, type: Water,		type2: Psychic,	favor: 1},
		{ id : 080, name: "Slowbro"		, type: Water,		type2: Psychic,	favor: 1},
		{ id : 081, name: "Magnemite"	, type: Electric,	type2: Steel, 	favor: 1},
		{ id : 082, name: "Magneton"	, type: Electric,	type2: Steel, 	favor: 1},
		{ id : 083, name: "Farfetch'd"	, type: Normal,		type2: Flying, 	favor: 1.1, chant: ["DUX"] },
		{ id : 084, name: "Doduo"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 085, name: "Dodrio"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 086, name: "Seel"		, type: Water,		type2: null, 	favor: 1},
		{ id : 087, name: "Dewgong"		, type: Water,		type2: Ice, 	favor: 1, hax:"heal", chant: ["Restgong", "Dewgong"] },
		{ id : 088, name: "Grimer"		, type: Poison,		type2: null, 	favor: 1},
		{ id : 089, name: "Muk"			, type: Poison,		type2: null, 	favor: 1},
		{ id : 090, name: "Shellder"	, type: Water,		type2: null, 	favor: 1},
		{ id : 091, name: "Cloyster"	, type: Water,		type2: Ice, 	favor: 1},
		{ id : 092, name: "Gastly"		, type: Ghost,		type2: Poison, 	favor: 1},
		{ id : 093, name: "Haunter"		, type: Ghost,		type2: Poison, 	favor: 1},
		{ id : 094, name: "Gengar"		, type: Ghost,		type2: Poison, 	favor: 1},
		{ id : 095, name: "Onix"		, type: Rock,		type2: Ground, 	favor: 1, hp:300},
		{ id : 096, name: "Drowzee"		, type: Psychic,	type2: null, 	favor: 1},
		{ id : 097, name: "Hypno"		, type: Psychic,	type2: null, 	favor: 1},
		{ id : 098, name: "Krabby"		, type: Water,		type2: null, 	favor: 1},
		{ id : 099, name: "Kingler"		, type: Water,		type2: null, 	favor: 1},
		{ id : 100, name: "Voltorb"		, type: Electric,	type2: null, 	favor: 1, hax:"explode" },
		{ id : 101, name: "Electrode"	, type: Electric,	type2: null, 	favor: 1, hax:"explode" },
		{ id : 102, name: "Exeggcute"	, type: Grass,		type2: Psychic,	favor: 1},
		{ id : 103, name: "Exeggutor"	, type: Grass,		type2: Psychic,	favor: 1},
		{ id : 104, name: "Cubone"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 105, name: "Marowak"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 106, name: "Hitmonlee"	, type: Fighting,	type2: null, 	favor: 1, chant: ["C3KO"] },
		{ id : 107, name: "Hitmonchan"	, type: Fighting,	type2: null, 	favor: 1},
		{ id : 108, name: "Lickitung"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 109, name: "Koffing"		, type: Poison,		type2: null, 	favor: 1, hax:"explode" },
		{ id : 110, name: "Weezing"		, type: Poison,		type2: null, 	favor: 1, hax:"explode" },
		{ id : 111, name: "Rhyhorn"		, type: Ground,		type2: Rock, 	favor: 1, hax:"horndrill" },
		{ id : 112, name: "Rhydon"		, type: Ground,		type2: Rock, 	favor: 1, hax:"horndrill" },
		{ id : 113, name: "Chansey"		, type: Normal,		type2: null, 	favor: 1, hax:"heal" },
		{ id : 114, name: "Tangela"		, type: Grass,		type2: null, 	favor: 1},
		{ id : 115, name: "Kangaskhan"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 116, name: "Horsea"		, type: Water,		type2: null, 	favor: 1},
		{ id : 117, name: "Seadra"		, type: Water,		type2: null, 	favor: 1},
		{ id : 118, name: "Goldeen"		, type: Water,		type2: null, 	favor: 1},
		{ id : 119, name: "Seaking"		, type: Water,		type2: null, 	favor: 1},
		{ id : 120, name: "Staryu"		, type: Water,		type2: null, 	favor: 1},
		{ id : 121, name: "Starmie"		, type: Water,		type2: Psychic,	favor: 1},
		{ id : 122, name: "Mr. Mime"	, type: Psychic,	type2: null, 	favor: 1},
		{ id : 123, name: "Scyther"		, type: Bug,		type2: Flying, 	favor: 1},
		{ id : 124, name: "Jynx"		, type: Ice,		type2: Psychic,	favor: 1},
		{ id : 125, name: "Electabuzz"	, type: Electric,	type2: null, 	favor: 1},
		{ id : 126, name: "Magmar"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 127, name: "Pinsir"		, type: Bug,		type2: null, 	favor: 1},
		{ id : 128, name: "Tauros"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 129, name: "Magikarp"	, type: Water,		type2: null, 	favor: 0.4, hax:"splash" },
		{ id : 130, name: "Gyarados"	, type: Water,		type2: Flying, 	favor: 1.05},
		{ id : 131, name: "Lapras"		, type: Water,		type2: Ice, 	favor: 1, hax:"perish song", hp: 250},
		{ id : 132, name: "Ditto"		, type: Normal,		type2: null, 	favor: 1, forbidden: true}, //don't want to program ditto's transform... O_o
		{ id : 133, name: "Eevee"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 134, name: "Vaporeon"	, type: Water,		type2: null, 	favor: 1},
		{ id : 135, name: "Jolteon"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 136, name: "Flareon"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 137, name: "Porygon"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 138, name: "Omanyte"		, type: Rock,		type2: Water, 	favor: 2.0, chant: ["Helix", "Lord Helix"] },
		{ id : 139, name: "Omastar"		, type: Rock,		type2: Water, 	favor: 2.1, chant: ["Helix", "Lord Helix"] },
		{ id : 140, name: "Kabuto"		, type: Rock,		type2: Water, 	favor: 1.9, chant: ["Dome"] },
		{ id : 141, name: "Kabutops"	, type: Rock,		type2: Water, 	favor: 2.0, chant: ["Dome"] },
		{ id : 142, name: "Aerodactyl"	, type: Rock,		type2: Flying, 	favor: 1.6, chant: ["Amber"] },
		{ id : 143, name: "Snorlax"		, type: Normal,		type2: null, 	favor: 1.9, hp:350},
		{ id : 144, name: "Articuno"	, type: Ice,		type2: Flying, 	favor: 1.8},
		{ id : 145, name: "Zapdos"		, type: Electric,	type2: Flying, 	favor: 1.8},
		{ id : 146, name: "Moltres"		, type: Fire,		type2: Flying, 	favor: 1.8},
		{ id : 147, name: "Dratini"		, type: Dragon,		type2: null, 	favor: 1.1},
		{ id : 148, name: "Dragonair"	, type: Dragon,		type2: null, 	favor: 1.4},
		{ id : 149, name: "Dragonite"	, type: Dragon,		type2: Flying, 	favor: 1.7, chant: ["Katie", "Dragonite"] },
		{ id : 150, name: "Mewtwo"		, type: Psychic,	type2: null, 	favor: 1},
		{ id : 151, name: "Mew"			, type: Psychic,	type2: null, 	favor: 2, chant: ["Marc", "Mew", "Karl Marc"], forbidden: true },
		{ id : 152, name: "Chikorita"	, type: Grass,		type2: null, 	favor: 1},
		{ id : 153, name: "Bayleef"		, type: Grass,		type2: null, 	favor: 1},
		{ id : 154, name: "Meganium"	, type: Grass,		type2: null, 	favor: 1},
		{ id : 155, name: "Cyndaquil"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 156, name: "Quilava"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 157, name: "Typhlosion"	, type: Fire,		type2: null, 	favor: 1},
		{ id : 158, name: "Totodile"	, type: Water,		type2: null, 	favor: 1.2, chant: ["LazorGator", "Gatoraide", "The Gator", "Gator"] },
		{ id : 159, name: "Croconaw"	, type: Water,		type2: null, 	favor: 1.5, chant: ["LazorGator", "Gatoraide", "The Gator", "Gator"] },
		{ id : 160, name: "Feraligatr"	, type: Water,		type2: null, 	favor: 1.8, chant: ["LazorGator", "Gatoraide", "The Gator", "Gator"] },
		{ id : 161, name: "Sentret"		, type: Normal,		type2: null, 	favor: 1.2, chant: ["Admiral"] },
		{ id : 162, name: "Furret"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 163, name: "Hoothoot"	, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 164, name: "Noctowl"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 165, name: "Ledyba"		, type: Bug,		type2: Flying, 	favor: 1},
		{ id : 166, name: "Ledian"		, type: Bug,		type2: Flying, 	favor: 1},
		{ id : 167, name: "Spinarak"	, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 168, name: "Ariados"		, type: Bug,		type2: Poison, 	favor: 1},
		{ id : 169, name: "Crobat"		, type: Poison,		type2: Flying, 	favor: 1.1},
		{ id : 170, name: "Chinchou"	, type: Water,		type2: Electric,favor: 1},
		{ id : 171, name: "Lanturn"		, type: Water,		type2: Electric,favor: 1},
		{ id : 172, name: "Pichu"		, type: Electric,	type2: null, 	favor: 0.9},
		{ id : 173, name: "Cleffa"		, type: Normal,		type2: null, 	favor: 0.8},
		{ id : 174, name: "Igglybuff"	, type: Normal,		type2: null, 	favor: 0.8},
		{ id : 175, name: "Togepi"		, type: Normal,		type2: null, 	favor: 0.8},
		{ id : 176, name: "Togetic"		, type: Normal,		type2: Flying, 	favor: 1},
		{ id : 177, name: "Natu"		, type: Psychic,	type2: Flying, 	favor: 1},
		{ id : 178, name: "Xatu"		, type: Psychic,	type2: Flying, 	favor: 1},
		{ id : 179, name: "Mareep"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 180, name: "Flaaffy"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 181, name: "Ampharos"	, type: Electric,	type2: null, 	favor: 1},
		{ id : 182, name: "Bellossom"	, type: Grass,		type2: null, 	favor: 1},
		{ id : 183, name: "Marill"		, type: Water,		type2: null, 	favor: 1, hax:"rollout" },
		{ id : 184, name: "Azumarill"	, type: Water,		type2: null, 	favor: 1, hax:"rollout" },
		{ id : 185, name: "Sudowoodo"	, type: Rock,		type2: null, 	favor: 1},
		{ id : 186, name: "Politoed"	, type: Water,		type2: null, 	favor: 1, hax:"perish song" },
		{ id : 187, name: "Hoppip"		, type: Grass,		type2: Flying, 	favor: 1},
		{ id : 188, name: "Skiploom"	, type: Grass,		type2: Flying, 	favor: 1},
		{ id : 189, name: "Jumpluff"	, type: Grass,		type2: Flying, 	favor: 1},
		{ id : 190, name: "Aipom"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 191, name: "Sunkern"		, type: Grass,		type2: null, 	favor: 1},
		{ id : 192, name: "Sunflora"	, type: Grass,		type2: null, 	favor: 1},
		{ id : 193, name: "Yanma"		, type: Bug,		type2: Flying, 	favor: 1},
		{ id : 194, name: "Wooper"		, type: Water,		type2: Ground, 	favor: 1, hp:250},
		{ id : 195, name: "Quagsire"	, type: Water,		type2: Ground, 	favor: 1},
		{ id : 196, name: "Espeon"		, type: Psychic,	type2: null, 	favor: 1},
		{ id : 197, name: "Umbreon"		, type: Dark,		type2: null, 	favor: 1},
		{ id : 198, name: "Murkrow"		, type: Dark,		type2: Flying, 	favor: 1},
		{ id : 199, name: "Slowking"	, type: Water,		type2: Psychic,	favor: 1},
		{ id : 200, name: "Misdreavus"	, type: Ghost,		type2: null, 	favor: 1},
		{ id : 201, name: "Unown"		, type: Psychic,	type2: null, 	favor: 1.1},
		{ id : 202, name: "Wobbuffet"	, type: Psychic,	type2: null, 	favor: 1, hax:"counter",},
		{ id : 203, name: "Girafarig"	, type: Normal,		type2: Psychic,	favor: 1},
		{ id : 204, name: "Pineco"		, type: Bug,		type2: null, 	favor: 1},
		{ id : 205, name: "Forretress"	, type: Bug,		type2: Steel, 	favor: 1},
		{ id : 206, name: "Dunsparce"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 207, name: "Gligar"		, type: Ground,		type2: Flying, 	favor: 1},
		{ id : 208, name: "Steelix"		, type: Steel,		type2: Ground, 	favor: 1.7, hp:300, chant: ["Solid Snake", "Steelix"], spbg:"-448px -480px" },
		{ id : 209, name: "Snubbull"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 210, name: "Granbull"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 211, name: "Qwilfish"	, type: Water,		type2: Poison, 	favor: 1},
		{ id : 212, name: "Scizor"		, type: Bug,		type2: Steel, 	favor: 1},
		{ id : 213, name: "Shuckle"		, type: Bug,		type2: Rock, 	favor: 1},
		{ id : 214, name: "Heracross"	, type: Bug,		type2: Fighting,favor: 1},
		{ id : 215, name: "Sneasel"		, type: Dark,		type2: Ice, 	favor: 1},
		{ id : 216, name: "Teddiursa"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 217, name: "Ursaring"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 218, name: "Slugma"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 219, name: "Magcargo"	, type: Fire,		type2: Rock, 	favor: 1},
		{ id : 220, name: "Swinub"		, type: Ice,		type2: Ground, 	favor: 1},
		{ id : 221, name: "Piloswine"	, type: Ice,		type2: Ground, 	favor: 1},
		{ id : 222, name: "Corsola"		, type: Water,		type2: Rock, 	favor: 1},
		{ id : 223, name: "Remoraid"	, type: Water,		type2: null, 	favor: 1},
		{ id : 224, name: "Octillery"	, type: Water,		type2: null, 	favor: 1},
		{ id : 225, name: "Delibird"	, type: Ice,		type2: Flying, 	favor: 1},
		{ id : 226, name: "Mantine"		, type: Water,		type2: Flying, 	favor: 1},
		{ id : 227, name: "Skarmory"	, type: Steel,		type2: Flying, 	favor: 1},
		{ id : 228, name: "Houndour"	, type: Dark,		type2: Fire, 	favor: 1},
		{ id : 229, name: "Houndoom"	, type: Dark,		type2: Fire, 	favor: 1},
		{ id : 230, name: "Kingdra"		, type: Water,		type2: Dragon, 	favor: 1},
		{ id : 231, name: "Phanpy"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 232, name: "Donphan"		, type: Ground,		type2: null, 	favor: 1},
		{ id : 233, name: "Porygon2"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 234, name: "Stantler"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 235, name: "Smeargle"	, type: Normal,		type2: null, 	favor: 1},
		{ id : 236, name: "Tyrogue"		, type: Fighting,	type2: null, 	favor: 1},
		{ id : 237, name: "Hitmontop"	, type: Fighting,	type2: null, 	favor: 1},
		{ id : 238, name: "Smoochum"	, type: Ice,		type2: Psychic, favor: 1},
		{ id : 239, name: "Elekid"		, type: Electric,	type2: null, 	favor: 1},
		{ id : 240, name: "Magby"		, type: Fire,		type2: null, 	favor: 1},
		{ id : 241, name: "Miltank"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 242, name: "Blissey"		, type: Normal,		type2: null, 	favor: 1},
		{ id : 243, name: "Raikou"		, type: Electric,	type2: null, 	favor: 1.8},
		{ id : 244, name: "Entei"		, type: Fire,		type2: null, 	favor: 1.8},
		{ id : 245, name: "Suicune"		, type: Water,		type2: null, 	favor: 1.8},
		{ id : 246, name: "Larvitar"	, type: Rock,		type2: Ground, 	favor: 1},
		{ id : 247, name: "Pupitar"		, type: Rock,		type2: Ground, 	favor: 1},
		{ id : 248, name: "Tyranitar"	, type: Rock,		type2: Dark, 	favor: 1},
		{ id : 249, name: "Lugia"		, type: Psychic,	type2: Flying, 	favor: 2, forbidden:true, spbg:"-240px -480px"},
		{ id : 250, name: "Ho-Oh"		, type: Fire,		type2: Flying, 	favor: 2, forbidden:true, spbg:"-336px -480px"},
		{ id : 251, name: "Celebi"		, type: Psychic,	type2: Grass, 	favor: 1.6, forbidden:true,},
	];
	
})();