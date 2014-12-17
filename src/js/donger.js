// donger.js
// For easy definition of dongers and Twitch emotes

module.exports = {
	dongerfy : function(str) {
		return str.replace(/\<d:(\w+)\>/ig, function(match, p1){
			return dongers[p1] || "";
		});
	},
	
	twitchify : function(str) {
		
	},
}

var dongers = {
	"riot" : "ヽ༼ຈل͜ຈ༽ﾉ",
	"riotover": "┌༼ຈل͜ຈ༽┐",
	"sophisticated" : "ヽ༼ຈل͜ರೃ༽ﾉ",
	"praise" : "༼ つ ◕_◕ ༽つ",
	"runningman": "ᕕ༼ຈل͜ຈ༽ᕗ",
	"dance" : "♫ ┌༼ຈل͜ຈ༽┘ ♪",
	"lenny": "( ͡° ͜ʖ ͡°)",
	"dongerhood": "༼ ºل͟º ༼ ºل͟º ༼ ºل͟º ༽ ºل͟º ༽ ºل͟º ༽",
	
	"tableflip" : "(╯°□°)╯︵ ┻━┻",
	"tableback" : "┬─┬ノ(ಠ_ಠノ)",
	"tableflip2" : "(ノಠ益ಠ)ノ ┻━┻",
	"tableback2" : "┬─┬ノ(ಠ益ಠノ)",
	"tableflip3" : "┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻",
	"tableback3" : "┬─┬ ︵ヽ(ಠ_ಠ)ﾉ︵ ┬─┬",
	"tableflip4" : "┬─┬﻿ ︵ /(.□. \\）",
	"tableback4" : "-( °-°)- ノ(ಠ_ಠノ)", 
	
	"wooper": "卅(◕‿◕)卅",
	"bronzonger": "└(oѪo)┘",
	"doot" : "⊹⋛⋋(◐⊝◑)⋌⋚⊹",
	"joltik": "╭<<◕°ω°◕>>╮",
	"megadonger" : "╲/╭༼ຈຈل͜ຈຈ༽╮/╱",
	"trapnich": "ヽ༼✪﹏✪༽ﾉ",
};



var copypasta = {
	"riotpolice" : [
		"(▀̿ ̿Ĺ̯▀̿ ̿) THIS IS THE RIOT POLICE. STOP RIOTING NOW (▀̿ ̿Ĺ̯▀̿ ̿)",
		"(⌐■_■)=/̵/'̿'̿ ̿ ̿ ヽ༼ຈل͜ຈ༽ﾉ THIS IS THE RIOT POLICE, CEASE RIOTING OR I SHOOT THE DONGER!!",
	],
	"like2raise" : "I like to raise my Donger I do it all the time ヽ༼ຈل͜ຈ༽ﾉ and every time its lowered┌༼ຈل͜ຈ༽┐ I cry and start to whine ┌༼@ل͜@༽┐But never need to worry ༼ ºل͟º༽ my Donger's staying strong ヽ༼ຈل͜ຈ༽ﾉA Donger saved is a Donger earned so sing the Donger song! ᕦ༼ຈل͜ຈ༽ᕤ",
	"megadonger" : [
		"╲/╭༼ຈຈل͜ຈຈ༽╮/╱ PRAISE THE MEGA-DONGER ╲/╭༼ຈຈل͜ຈຈ༽╮/╱",
		"ヽ༼ຈل͜ຈ༽ﾉ donger's dongite is reacting to the mega stone ((ヽ༼ຈل͜ຈ༽ﾉ)) donger evolved into mega donger \"╲/༼ຈຈل͜ຈຈ༽/╱\" mega donger used raise, it's super effective wild lowered dong fainted",
		"ヽ༼ຈل͜ຈ༽ﾉ Donger is reacting to the Dongerite! ,/╲/╭༼ຈຈل͜ຈຈ༽╮/╱, Donger Mega Evolved into Mega Donger!",
		"DONGER'S DONGERITE IS REACTING TO THE MEGA RING! ,/╲/╭༼ຈຈل͜ຈຈ༽╮/╱﻿, MEGA RIOT ,/╲/╭༼ຈຈل͜ຈຈ༽╮/╱﻿,",
	],
	"ripdoof" : "I... I just wanted to deposit Bidoof. She was so good to us... always so loyal. When she couldn't evolve for us, she went to the Daycare happily, and then came back happily, wearing that stupid grin on her face all the while. When we asked her to go to the PC, she never once complained. She was just there for us, loyally, the way she always had been....And then we killed her. RIP Doof, you will be missed. :(",
	"twitch" : [
		"I'm a Twitch employee and I'm stopping by to say your Twitch chat is out of control. I have received several complaints from your very own viewers that their chat experience is ruined because of constant Emote and Copypasta spamming. This type unacceptable by Twitch's standards and if your mods don't do something about it we will be forced to shut down your channel. Wish you all the best - Twitch",
		/* Park version */"I'm a Twitch employee and I'm stopping by to say your Twitch chat looks too much like the official twitch chat. I have received several complaints from your very own visitors that their chat experience is ruined because of constant chat being spammed on the right-hand side. This is unacceptable by Twitch's TOS and if your mods don't do something about it we will be forced to shut down your park. Wish you all the best - Twitch",
	],
	"stillathing" : [
		"Is tpp still a thing?",
		"Is tpp still a thing? Kappa",
		"Is \"Is tpp still a thing?\" still a thing?",
		"Is \"Is \"Is tpp still a thing?\" still a thing?\" still a thing?",
		"Is \"Is \"Is \"Is tpp still a thing?\" still a thing?\" still a thing?\" still a thing?",
		"Is \"Is \"Is \"Is Is \"Is \"Is \"Is tpp still a thing?\" still a thing?\" still a thing?\" still a thing? still a thing?\" still a thing?\" still a thing?\" still a thing?",
	],
	"danceriot" : [
		"♫ ┌༼ຈل͜ຈ༽┘ DANCE RIOT ♪ └༼ຈل͜ຈ༽┐ ♫",
		"♫ ┌༼ຈل͜ຈ༽┘ ♪ DANCE RIOT ♪ └༼ຈل͜ຈ༽┐ ♫",
		"♫ ┌༼ຈل͜ຈ༽┘ ♪ DANCE RIOT ♫ ┌༼ຈل͜ຈ༽┘ ♪",
	],
	"riot" : [
		"ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ",
	],
	"letitdong" : "ヽ༼ຈل͜ຈ༽ﾉ LET IT DONG, LET IT DONG, COULDN'T RIOT BACK ANYMORE. LET IT DONG, LET IT DONG, LET'S GET BACK TO THE LORE, I DON'T CARE THAT THE DONGERS WERE GONE, LET THE DONGS RAGE ON, THE RIOT NEVER BOTHERED ME ANYWAY. ヽ༼ຈل͜ຈ༽ﾉ",
	
	"dontspam" : function() {
		var a = "spam";
		const repl = ["RIOT", "beat misty", "༼ つ ◕_◕ ༽つ"];
		
		const spam = "Guys can you please not [%d] the chat. My mom bought me this new laptop and it gets really hot when the chat is being [%d]ed. Now my leg is starting to hurt because it is getting so hot. Please, if you don’t want me to get burned, then dont [%d] the chat",
	},
	
	"awefulhumans" : "Humans are awful. This planet would be way better if there were no humans in it. True story. DON'T COPY THIS",
	"ruinedchat" : "You guys are ruining my twitch chat experience. I come to the twitch chat for mature conversation about the gameplay, only to be awarded with kappa faces and frankerzs. People who spam said faces need medical attention utmost. The twitch chat is serious business, and the mods should really raise their dongers.",
	"googleadmin" : "Hello everyone, this is the Google Admin here to remind you all that while we love the chat experience, please refrain from copy pasting in the chat. This ruins the atmosphere and makes everybody’s chat experience worse overall. Thank you and remember to link your Twitch and Google+ account today!",
	"badstadiumrequest" : "Wow 0/10 to the guy who thought of this request, APPLAUSE CLAP CLAP LADY GAGA APPLAUSE APPLAUSE APPLAUSE",
};

//Starbolt_omega KZhelghast